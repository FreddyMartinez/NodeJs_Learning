import express from "express";
import { SIGNUP_URI } from "../util/constants";
import { createUser } from "./bll/user";

const app = express();
app.use(express.json());

app.post(SIGNUP_URI, async (req, res) => {
  const [status, message] = await createUser(req.body);
  res.status(status).send({ message });
});

export { app };
