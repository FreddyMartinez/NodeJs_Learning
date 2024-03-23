import { encrypt, generateSalt } from "../../util/encrypt";
import { User } from "../db/user";

export async function createUser(
  body: UserBase
): Promise<string> {
  const { username, email, password } = body;
  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  await User.create({ username, email, password: hashedPassword });
  return "USER_MESSAGES.USER_REGISTERED";
}

export async function getUserByEmail(email: string) {
  return User.findOne({ where: { email } });
}
