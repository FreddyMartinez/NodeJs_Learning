import express from 'express';
import { SIGNUP_URI } from "../util/constants";
import { User } from './db/user';
import { encrypt, generateSalt } from '../util/encrypt';

const app = express();

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.post(SIGNUP_URI, async (req, res) => {
  const { username, email, password } = req.body as UserBase;

  if (!username || !email || !password) {
    return res.status(400).send({ message: "Invalid request" });
  }

  const salt = generateSalt();
  const hashedPassword = await encrypt(password, salt);
  await User.create({ username, email, password: hashedPassword });
  res.send({ message: "User registered" });
});

export { app };