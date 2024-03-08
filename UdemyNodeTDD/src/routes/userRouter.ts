import { Router } from "express";
import { SIGNUP_URI } from "../../util/constants";
import { createUser } from "../bll/user";

const router = Router();

router.post(SIGNUP_URI, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).send({ message: "Invalid request" });
    return;
  }

  const [status, message] = await createUser(req.body);
  res.status(status).send({ message });
});

export { router as userRouter };
