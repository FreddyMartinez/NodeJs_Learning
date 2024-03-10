import { Router } from "express";
import { SIGNUP_URI } from "../../util/constants";
import { createUser } from "../bll/user";
import { check, validationResult } from "express-validator";

const router = Router();

router.post(
  SIGNUP_URI,
  check("username").notEmpty().withMessage("Username is required"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email is invalid"),
  check("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors: Record<string, string> = {};
      errors.array().forEach((error) => {
        if (error.type === "field") {
          validationErrors[error.path] = error.msg;
        }
      });
      return res.status(400).send({ validationErrors });
    }

    const [status, message] = await createUser(req.body);
    res.status(status).send({ message });
  }
);

export { router as userRouter };
