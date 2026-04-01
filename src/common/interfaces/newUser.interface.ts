interface NewUser {
    username:string,
    email:string,
    password:string,
    bio?:string,
    profilePicture?:string,
    coverPicture?:string,
    confirmed?: boolean,
}

export default NewUser;