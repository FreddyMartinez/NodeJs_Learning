import express from 'express';
import { SIGNUP_URI } from "../util/constants";

const app = express();

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.post(SIGNUP_URI, (req, res) => {
  const { username, email, password } = req.body;
  
  if(!username || !email || !password) {
    return res.status(400).send({ message: 'Invalid request'});
  }

  res.send({ message: 'User registered'});
});

export { app };