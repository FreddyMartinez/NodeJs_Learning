import request from "supertest";
import { app } from "../src/app";
import { SIGNUP_URI } from "../util/constants";
import { User } from "../src/db/user";
import { dbInstance } from "../src/db/dbInstance";

const user = {
  username: "user",
  email: "user@email.com",
  password: "password",
};

beforeAll(() => {
  return dbInstance.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe("UserRegister", () => {
  const postReqValidUser = () => request(app).post(SIGNUP_URI).send(user);

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

  it("should return 400 Bad Request when email is missing", async () => {
    const incompleteUser: Record<string, string> = { ...user };
    delete incompleteUser.email;
    const response = await request(app).post(SIGNUP_URI).send(incompleteUser);
    expect(response.status).toBe(400);
  });

  it("should return validation error when email is missing", async () => {
    const incompleteUser: Record<string, string> = { ...user };
    delete incompleteUser.email;
    const response = await request(app).post(SIGNUP_URI).send(incompleteUser);
    expect(response.body).toMatchObject({ validationErrors: { email: "Email is required" } });
  });

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
