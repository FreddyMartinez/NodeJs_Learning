import { Router } from "express";
import { SIGNUP_URI } from "../../util/constants";
import { createUser } from "../bll/user";

const router = Router();

router.post(SIGNUP_URI, (req, res, next) => {
  const { username, email, password } = req.body;

  const validationErrors: Record<string, string> = {};
  if (!username ) {
    validationErrors.username = "Username is required";
  }
  if (!email) {
    validationErrors.email = "Email is required";
  }
  if (!password) {
    validationErrors.password = "Password is required";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).send({ validationErrors });
  }

  next();
} , async (req, res) => {
  const [status, message] = await createUser(req.body);
  res.status(status).send({ message });
});

export { router as userRouter };
