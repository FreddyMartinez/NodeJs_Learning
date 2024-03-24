import request from "supertest";
import { app } from "../src/app";
import { SIGNUP_URI } from "../util/constants";
import { User } from "../src/db/user";
import { dbInstance } from "../src/db/dbInstance";
import { USER_MESSAGES } from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import nodemailerStub from "nodemailer-stub";

const user = {
  username: "user",
  email: "user@email.com",
  password: "Password1",
};

const userPostReqWithLang = (lang: string) => (payload: Record<string, unknown>) =>
request(app).post(SIGNUP_URI).set("Accept-Language", lang).send(payload); 

const userPostRequest = userPostReqWithLang("");

beforeAll(() => {
  return dbInstance.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe("UserRegister", () => {
  const postReqValidUser = () => userPostRequest(user);

  it("should return status 200 and success message when signup request is valid", async () => {
    const response = await postReqValidUser();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: USER_MESSAGES.USER_REGISTERED });
  });

  it("should return 400 Bad Request when username is missing", (done) => {
    const incompleteUser: Record<string, string> = { ...user };
    delete incompleteUser.username;
    request(app).post(SIGNUP_URI).send(incompleteUser).expect(400, done);
  });

  it.each([
    ["username", USER_MESSAGES.USERNAME_REQUIRED],
    ["email", USER_MESSAGES.EMAIL_REQUIRED],
    ["password", USER_MESSAGES.PASSWORD_REQUIRED],
  ])("should return validation error when %s is missing", async (field, expectedMessage) => {
    const incompleteUser: Record<string, string> = { ...user };
    delete incompleteUser[field];
    const response = await request(app).post(SIGNUP_URI).send(incompleteUser);
    expect(response.body).toMatchObject({ validationErrors: { [field]: expectedMessage } });
  });

  it("should return a validation error for each missing key", async () => {
    const incompleteUser = { };
    const response = await userPostRequest(incompleteUser);
    const errors = response.body.validationErrors;
    const keys = Object.keys(errors);
    expect(keys.length).toBe(3);
    expect(keys).toContain("username");
    expect(keys).toContain("email");
    expect(keys).toContain("password");
  });

  it.each`
    field         | value              | error                              | expectedMessage
    ${"username"} | ${"abc"}           | ${"has less than 4 characters"}    | ${USER_MESSAGES.USERNAME_MIN_LENGTH}
    ${"username"} | ${"a".repeat(33)}  | ${"has more than 32 characters"}   | ${USER_MESSAGES.USERNAME_MAX_LENGTH}
    ${"email"}    | ${"invalid-email"} | ${"is not a valid email"}          | ${USER_MESSAGES.EMAIL_NOT_VALID}
    ${"password"} | ${"Pass"}          | ${"has less than 5 characters"}    | ${USER_MESSAGES.PASSWORD_MIN_LENGTH}
    ${"password"} | ${"onlylower1"}    | ${"doesn't have upercase values"}  | ${USER_MESSAGES.PASSWORD_FORMAT}
    ${"password"} | ${"ONLYUPPER2"}    | ${"doesn't have lowercase values"} | ${USER_MESSAGES.PASSWORD_FORMAT}
    ${"password"} | ${"noNumber"}      | ${"doesn't have a number"}         | ${USER_MESSAGES.PASSWORD_FORMAT}
  `(
    "should return validation error when $field $error",
    async ({ field, value, expectedMessage }) => {
      const invalidUser = { ...user, [field]: value };
      const response = await request(app).post(SIGNUP_URI).send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        validationErrors: { [field]: expectedMessage },
      });
    }
  );

  it("should save the user to the database", (done) => {
    postReqValidUser()
      .then(() => {
        return User.findAll({ where: { email: user.email } });
      })
      .then((users) => {
        expect(users.length).toBe(1);
        done();
      });
  });

  it("should save the user's password as a hash", async () => {
    const response = await postReqValidUser();
    expect(response.status).toBe(200);
    const users = await User.findAll({ where: { email: user.email } });
    expect(users.length).toBe(1);
    const savedUser = users[0];
    expect(savedUser.password).not.toBe(user.password);
  });

  it("should return Email in use when email is already in the database", async () => {
    const res = await postReqValidUser();
    expect(res.status).toBe(200);

    const response = await postReqValidUser();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ validationErrors: { email: USER_MESSAGES.EMAIL_IN_USE } });
  });
});

describe("UserRegister with different languages", () => {
  const userPostRequestSpanish = userPostReqWithLang("es");

  it("should return status 200 and success message when signup request is valid", async () => {
    const response = await userPostRequestSpanish(user);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: es.USER_MESSAGES.USER_REGISTERED });
  });

  it.each`
    field         | value              | error                              | expectedMessage
    ${"username"} | ${"abc"}           | ${"has less than 4 characters"}    | ${es.USER_MESSAGES.USERNAME_MIN_LENGTH}
    ${"username"} | ${"a".repeat(33)}  | ${"has more than 32 characters"}   | ${es.USER_MESSAGES.USERNAME_MAX_LENGTH}
    ${"email"}    | ${"invalid-email"} | ${"is not a valid email"}          | ${es.USER_MESSAGES.EMAIL_NOT_VALID}
    ${"password"} | ${"Pass"}          | ${"has less than 5 characters"}    | ${es.USER_MESSAGES.PASSWORD_MIN_LENGTH}
    ${"password"} | ${"onlylower1"}    | ${"doesn't have upercase values"}  | ${es.USER_MESSAGES.PASSWORD_FORMAT}
    ${"password"} | ${"ONLYUPPER2"}    | ${"doesn't have lowercase values"} | ${es.USER_MESSAGES.PASSWORD_FORMAT}
    ${"password"} | ${"noNumber"}      | ${"doesn't have a number"}         | ${es.USER_MESSAGES.PASSWORD_FORMAT}
  `(
    "should return validation error when $field $error",
    async ({ field, value, expectedMessage }) => {
      const invalidUser = { ...user, [field]: value };
      const response = await userPostRequestSpanish(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        validationErrors: { [field]: expectedMessage },
      });
    }
  );
});

describe("SignUp should send email", () => {
  const postReqValidUser = () => userPostRequest(user);
  
  it("should create user in 'inactive' mode", async () => {
    const activeUser = { ...user, active: true };
    await userPostRequest(activeUser);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.active).toBe(false);
  });

  it("should create an activation token for user", async () => {
    await postReqValidUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });

  it("should send an email with activation link", async () => {
    await postReqValidUser();
    const lastMail = nodemailerStub.interactsWithMail.lastMail();
    expect(typeof lastMail.to).toBe("object");
    expect(lastMail.to).toContain(user.email);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail.content).toContain(savedUser.activationToken);
  });
});