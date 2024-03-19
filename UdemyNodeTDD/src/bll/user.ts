import { encrypt, generateSalt } from "../../util/encrypt";
import { User } from "../db/user";
import { EmailError } from "../../util/errors";

export async function createUser(
  body: UserBase
): Promise<string> {
  const { username, email, password } = body;
  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  try {
    await User.create({ username, email, password: hashedPassword });
    return "User registered";
  } catch (error) {
    throw new EmailError("USER_MESSAGES.EMAIL_IN_USE");
  }
}
