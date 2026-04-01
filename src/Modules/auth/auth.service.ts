import {
    ISignIn,
    ISignUp,
    generateToken,
    comparePassword,
    IGoogleSignIn,
    verifyGoogleAuthCode,
    IConfirmOtp,
    IResetPassword,
    IUpdatePassword,
    generateOtp,
    otpCacheKey,
    passwordResetOtpKey,
    SIGNUP_OTP_TTL_SEC,
    PASSWORD_RESET_OTP_TTL_SEC,
    sendOtpEmail,
    normalizeEmail,
} from "../../common";
import { setSession, getSession, delSession } from "../../common/services/redis.service";
import {usersRepo} from "../../DB"

const badRequest = (msg: string): Error & { statusCode: number } =>
    Object.assign(new Error(msg), { statusCode: 400 });


export type AuthHttpResult = {
    statusCode: number;
    body: Record<string, unknown>;
};

type SignUpBody = ISignUp;
type SignInBody = { email?: string; password?: string; token?: string };
type UpdatePasswordBody = IUpdatePassword;

class Auth{
    constructor(){};

    async handleSignUp(body: SignUpBody): Promise<AuthHttpResult> {
        const message = await this.signUp(body);
        return { statusCode: 201, body: { message } };
    }

    async handleConfirmOtp(body: IConfirmOtp): Promise<AuthHttpResult> {
        const message = await this.confirmOtp(body);
        return { statusCode: 200, body: { message } };
    }

    async handleSignIn(body: SignInBody): Promise<AuthHttpResult> {
        const tokens =
            body.token != null && body.token !== ""
                ? await this.signIn({ token: body.token })
                : await this.signIn({
                      email: body.email!,
                      password: body.password!,
                  });
        return {
            statusCode: 200,
            body: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    async handleForgotPassword(body: { email: string }): Promise<AuthHttpResult> {
        const message = await this.forgotPassword(body.email);
        return { statusCode: 200, body: { message } };
    }

    async handleResetPassword(body: IResetPassword): Promise<AuthHttpResult> {
        const message = await this.resetPassword(body);
        return { statusCode: 200, body: { message } };
    }

    async handleUpdatePassword(
        userId: string,
        body: UpdatePasswordBody,
    ): Promise<AuthHttpResult> {
        const message = await this.updatePassword(userId, body);
        return { statusCode: 200, body: { message } };
    }

   async signIn(
        userData: ISignIn | IGoogleSignIn,
    ): Promise<{ accessToken: string; refreshToken: string }>
    {
        try {
        if("token" in userData)
        {
            const payload=await verifyGoogleAuthCode(userData.token);
            let user=await usersRepo.findByEmail(payload.email!);
            if(!user){
                console.log("New user signing up via Google");
                await this.signUp({
                    username: payload.name ?? payload.email!.split('@')[0] ?? "user",
                    email: normalizeEmail(payload.email!),
                    password:payload.sub!,
                    profilePicture:payload.picture || "",
                }, { skipEmailVerification: true });
                user = await usersRepo.findByEmail(payload.email!);
            };
            if (!user) throw new Error("User registration failed");

            const tokens = generateToken({
                _id: user._id,
                role: user.role,
                email: user.email,
            });
            console.log("Done Signed In");
            return tokens; 
        }
        const user= await usersRepo.findByEmail(userData.email);
        if(!user) throw new Error("User Not Found");
        if (!user.confirmed) {
            throw badRequest("Please verify your email before signing in");
        }
        const isPasswordValid=await comparePassword(userData.password,user.password);
        if(!isPasswordValid) throw new Error("Invalid Password");
        const tokens = generateToken({
            _id: user._id,
            role: user.role,
            email: user.email,
        });
        return tokens; 
        } catch (error) {
            console.log(error);
            throw error;
        }
        
    }
    async signUp(
        userData: ISignUp,
        options?: { skipEmailVerification?: boolean },
    ): Promise<string> {
        const confirmed = options?.skipEmailVerification === true;
        try {
            await usersRepo.create({ ...userData, confirmed });
            if (confirmed) {
                return "User Created Successfully";
            }
            const otp = generateOtp();
            const key = otpCacheKey(userData.email);
            await setSession(key, otp, SIGNUP_OTP_TTL_SEC);
            try {
                await sendOtpEmail(userData.email, otp, {
                    expiresInMinutes: SIGNUP_OTP_TTL_SEC / 60,
                });
            } catch (mailErr) {
                await delSession(key);
                await usersRepo.deleteByEmail(userData.email);
                throw mailErr;
            }
            return "Account created. Check your email for a verification code.";
        } catch (error) {
            throw error;
        }
    }

    async confirmOtp(data: IConfirmOtp): Promise<string> {
        const key = otpCacheKey(data.email);
        const stored = await getSession(key);
        const otp = String(data.otp).replace(/\s+/g, "");
        if (stored == null || String(stored) !== otp) {
            throw badRequest("Invalid or expired verification code");
        }
        const user = await usersRepo.findByEmail(data.email);
        if (!user) {
            throw badRequest("User not found");
        }
        if (user.confirmed) {
            await delSession(key);
            return "Email already verified";
        }
        await usersRepo.setConfirmedByEmail(data.email, true);
        await delSession(key);
        return "Email verified successfully. You can sign in.";
    }

    async forgotPassword(email: string): Promise<string> {
        const user = await usersRepo.findByEmail(email);
        const generic =
            "If an account exists for this email, a password reset code has been sent.";
        if (!user || !user.confirmed) {
            return generic;
        }
        const otp = generateOtp();
        const key = passwordResetOtpKey(email);
        await setSession(key, otp, PASSWORD_RESET_OTP_TTL_SEC);
        try {
            await sendOtpEmail(user.email, otp, {
                expiresInMinutes: PASSWORD_RESET_OTP_TTL_SEC / 60,
                purpose: "password-reset",
            });
        } catch (err) {
            await delSession(key);
            throw err;
        }
        return generic;
    }

    async resetPassword(data: IResetPassword): Promise<string> {
        const key = passwordResetOtpKey(data.email);
        const stored = await getSession(key);
        const otp = String(data.otp).replace(/\s+/g, "");
        if (stored == null || String(stored) !== otp) {
            throw badRequest("Invalid or expired reset code");
        }
        const user = await usersRepo.findByEmail(data.email);
        if (!user) {
            throw badRequest("User not found");
        }
        await usersRepo.updatePasswordForUserId(String(user._id), data.newPassword);
        await delSession(key);
        return "Password updated successfully. You can sign in with your new password.";
    }

    async updatePassword(userId: string, data: IUpdatePassword): Promise<string> {
        const user = await usersRepo.findById(userId);
        if (!user) {
            throw badRequest("User not found");
        }
        const ok = await comparePassword(data.currentPassword, user.password);
        if (!ok) {
            throw badRequest("Current password is incorrect");
        }
        if (data.currentPassword === data.newPassword) {
            throw badRequest("New password must be different from the current password");
        }
        await usersRepo.updatePasswordForUserId(userId, data.newPassword);
        return "Password updated successfully.";
    }
}

export const auth=new Auth();