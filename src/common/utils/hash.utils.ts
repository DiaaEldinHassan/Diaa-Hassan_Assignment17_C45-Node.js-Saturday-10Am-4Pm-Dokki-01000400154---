import bcrypt from "bcrypt";
import { salt } from "../../config/config.service";

// Hashing Function
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, salt);
};

// Comparing Function
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
