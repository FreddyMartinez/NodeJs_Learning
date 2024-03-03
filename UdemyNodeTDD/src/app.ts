import express from 'express';
import { SIGNUP_URI } from "../util/constants";
import { User } from './db/user';

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

  await User.create({ username, email, password });
  res.send({ message: "User registered" });
});

export { app };