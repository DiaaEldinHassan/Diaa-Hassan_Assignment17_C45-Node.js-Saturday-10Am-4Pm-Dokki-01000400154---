import mongoose from "mongoose";
import { hashPassword, roleEnum } from "../../common";
import { normalizeEmail } from "../../common/utils/otp.utils";

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 320,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 30,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  profilePicture: {
    type: String,
    trim: true,
  },
  coverPicture: {
    type: String,
    trim: true,
  },
  role:{
    type: String,
    enum:roleEnum,
    default:roleEnum.USER,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

usersSchema.pre("validate", function () {
  if (this.isModified("email") && typeof this.email === "string") {
    this.email = normalizeEmail(this.email);
  }
});

usersSchema.pre("save",async function(){
  if(!this.isModified("password")) return ;
  this.password=await hashPassword(this.password);
})

const usersModel =
  mongoose.models.Users || mongoose.model("Users", usersSchema);
export default usersModel;