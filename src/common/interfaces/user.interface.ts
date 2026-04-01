import NewUser from "./newUser.interface";

export interface User extends NewUser {
    _id: any;
    role: string;
    confirmed: boolean;
}
