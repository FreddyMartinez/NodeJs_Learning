import { Request, RequestHandler, Router } from "express";
import { SIGNUP_URI } from "../../util/constants";
import { createUser } from "../bll/user";

const router = Router();

interface CustomRequest extends Request {
  validationErrors?: Record<string, string>;
}

const validateUser: RequestHandler = (req: CustomRequest, _, next) => {
  const { username } = req.body;

  if (!username ) {
    req.validationErrors = { username: "Username is required"};
  }

  next();
};


const validateEmail: RequestHandler = (req: CustomRequest, _, next) => {
  const { email } = req.body;

  if (!email) {
    req.validationErrors = { ...req.validationErrors, email: "Email is required" };
  }

  next();
};

const validatePassword: RequestHandler = (req: CustomRequest, _, next) => {
  const { password } = req.body;

  if (!password) {
    req.validationErrors = { ...req.validationErrors, password: "Password is required" };
  }

  next();
};

router.post(SIGNUP_URI, validateUser, validateEmail, validatePassword, async (req: CustomRequest, res) => {
  if (req.validationErrors) {
    return res.status(400).send({ validationErrors: req.validationErrors });
  }

  const [status, message] = await createUser(req.body);
  res.status(status).send({ message });
});

export { router as userRouter };
