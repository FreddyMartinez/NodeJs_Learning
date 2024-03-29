import { Router } from "express";
import { SIGNUP_URI } from "../../util/constants";
import { createUser, getUserByEmail } from "../bll/user";
import { check, validationResult } from "express-validator";
import { EmailError } from "../../util/errors";

const router = Router();

router.post(
  SIGNUP_URI,
  check("username")
    .notEmpty()
    .withMessage("USER_MESSAGES.USERNAME_REQUIRED")
    .bail()
    .isLength({ min: 4 })
    .withMessage("USER_MESSAGES.USERNAME_MIN_LENGTH")
    .isLength({ max: 32 })
    .withMessage("USER_MESSAGES.USERNAME_MAX_LENGTH"),
  check("email")
    .notEmpty()
    .withMessage("USER_MESSAGES.EMAIL_REQUIRED")
    .bail()
    .isEmail()
    .withMessage("USER_MESSAGES.EMAIL_NOT_VALID")
    .bail()
    .custom(async (email) => {
      const user = await getUserByEmail(email);
      if (user) {
        throw new EmailError("USER_MESSAGES.EMAIL_IN_USE");
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("USER_MESSAGES.PASSWORD_REQUIRED")
    .bail()
    .isLength({ min: 5 })
    .withMessage("USER_MESSAGES.PASSWORD_MIN_LENGTH")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage("USER_MESSAGES.PASSWORD_FORMAT"),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors: Record<string, string> = {};
      errors.array().forEach((error) => {
        if (error.type === "field") {
          validationErrors[error.path] = req.t(error.msg);
        }
      });
      return res.status(400).send({ validationErrors });
    }

    try {
      const message = await createUser(req.body);
      res.status(200).send({ message: req.t(message) });
    } catch (error) {
      if (error instanceof EmailError) {
        return res.status(502).send({ message: req.t(error.message) });
      }
    }
  }
);

export { router as userRouter };
