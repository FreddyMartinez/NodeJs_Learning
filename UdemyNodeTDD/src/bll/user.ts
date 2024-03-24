import { encrypt, generateSalt, generateToken } from "../../util/encrypt";
import { User } from "../db/user";
import { sendEmail } from "./email";

export async function createUser(
  body: UserBase
): Promise<string> {
  const { username, email, password } = body;
  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  const activationToken = generateToken(16);
  await User.create({
    username,
    email,
    password: hashedPassword,
    activationToken,
  });
  await sendEmail(email, activationToken);
  return "USER_MESSAGES.USER_REGISTERED";
}

export async function getUserByEmail(email: string) {
  return User.findOne({ where: { email } });
}
