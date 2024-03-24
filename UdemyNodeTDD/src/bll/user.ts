import { encrypt, generateSalt, generateToken } from "../../util/encrypt";
import { EmailError } from "../../util/errors";
import { dbInstance } from "../db/dbInstance";
import { User } from "../db/user";
import { sendEmail } from "../services/email";

export async function createUser(
  body: UserBase
): Promise<string> {
  const { username, email, password } = body;
  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  const activationToken = generateToken(16);
  const transaction = await dbInstance.transaction();
  await User.create({
    username,
    email,
    password: hashedPassword,
    activationToken,
  }, {
    transaction
  });
  try {
    await sendEmail(email, activationToken);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new EmailError("USER_MESSAGES.ERROR_SENDING_EMAIL");
  }
  return "USER_MESSAGES.USER_REGISTERED";
}

export async function getUserByEmail(email: string) {
  return User.findOne({ where: { email } });
}
