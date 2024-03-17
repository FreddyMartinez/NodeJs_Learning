import { Router } from "express";
import { SIGNUP_URI, USER_MESSAGES } from "../../util/constants";
import { createUser } from "../bll/user";
import { check, validationResult } from "express-validator";

const router = Router();

router.post(
  SIGNUP_URI,
  check("username")
    .notEmpty()
    .withMessage(USER_MESSAGES.USERNAME_REQUIRED)
    .bail()
    .isLength({ min: 4 })
    .withMessage(USER_MESSAGES.USERNAME_MIN_LENGTH)
    .isLength({ max: 32 })
    .withMessage(USER_MESSAGES.USERNAME_MAX_LENGTH),
  check("email")
    .notEmpty()
    .withMessage(USER_MESSAGES.EMAIL_REQUIRED)
    .bail()
    .isEmail()
    .withMessage(USER_MESSAGES.EMAIL_NOT_VALID),
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
