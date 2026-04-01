export interface ISignIn{
    email:string;
    password:string;
}

export interface ISignUp{
    username:string;
    email:string;
    password:string;
    bio?:string;
    profilePicture?:string;
    coverPicture?:string;
}

export interface IGoogleSignIn{
    token:string;
}

export interface IConfirmOtp {
    email: string;
    otp: string;
}

export interface IResetPassword {
    email: string;
    otp: string;
    newPassword: string;
}

export interface IUpdatePassword {
    currentPassword: string;
    newPassword: string;
}