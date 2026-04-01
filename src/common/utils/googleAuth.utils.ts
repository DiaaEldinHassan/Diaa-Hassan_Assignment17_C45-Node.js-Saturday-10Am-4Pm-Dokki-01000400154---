import { OAuth2Client, TokenPayload } from "google-auth-library";
import { googleClientId,googleClientSecret } from "../../config/config.service";

const googleClient = new OAuth2Client(
    googleClientId,
    googleClientSecret,
    "postmessage"
);

export const verifyGoogleAuthCode = async (code: string): Promise<TokenPayload> => {
    try {
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token!, 
            audience: googleClientId
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Invalid token payload");
        }

        return payload as TokenPayload;
    } catch (error: any) {
        const safeMessage = String(error.message || "").replace(/[\r\n]/g, " ");
        console.error("Google Exchange Error:", safeMessage);
        throw new Error("Failed to exchange auth code for tokens");
    }
}