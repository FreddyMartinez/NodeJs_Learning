import { encrypt, generateSalt } from "../../util/encrypt";
import { User } from "../db/user";

export async function createUser(body: UserBase): Promise<[number, string]> {
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return [400, "Invalid request"];
  }

  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  await User.create({ username, email, password: hashedPassword });
  return [200, "User registered"];
}
