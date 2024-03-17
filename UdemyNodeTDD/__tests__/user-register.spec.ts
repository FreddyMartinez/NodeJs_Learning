import request from "supertest";
import { app } from "../src/app";
import { SIGNUP_URI, USER_MESSAGES } from "../util/constants";
import { User } from "../src/db/user";
import { dbInstance } from "../src/db/dbInstance";

const user = {
  username: "user",
  email: "user@email.com",
  password: "password",
};

const userPostRequest = (payload: Record<string, unknown>) =>
  request(app).post(SIGNUP_URI).send(payload);

beforeAll(() => {
  return dbInstance.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe("UserRegister", () => {
  const postReqValidUser = () => userPostRequest(user);

  it("should return 200 Ok when signup request is valid", (done) => {
    postReqValidUser().expect(200, done);
  });

  it("should return success message when signup request is valid", (done) => {
    postReqValidUser().then((response) => {
      expect(response.body).toEqual({ message: "User registered" });
      done();
    });
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
    field         | value              | error                            | expectedMessage
    ${"username"} | ${"abc"}           | ${"has less than 4 characters"}  | ${USER_MESSAGES.USERNAME_MIN_LENGTH}
    ${"username"} | ${"a".repeat(33)}  | ${"has more than 32 characters"} | ${USER_MESSAGES.USERNAME_MAX_LENGTH}
    ${"email"}    | ${"invalid-email"} | ${"is not a valid email"}        | ${USER_MESSAGES.EMAIL_NOT_VALID}
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

});
