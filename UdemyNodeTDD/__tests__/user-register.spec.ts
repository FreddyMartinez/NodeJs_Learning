import request from "supertest";
import { app } from "../src/app";
import { SIGNUP_URI } from "../util/constants";

describe("UserRegister", () => {
  it("should return 200 Ok when signup request is valid", (done) => {
    request(app)
      .post(SIGNUP_URI)
      .send({
        username: "user",
        email: "user@mail.com",
        password: "password",
      })
      .expect(200, done);
  });

  it("should return success message when signup request is valid", (done) => {
    request(app)
      .post(SIGNUP_URI)
      .send({
        username: "user",
        email: "user@email.com",
        password: "password",
      })
      .then((response) => {
        expect(response.body).toEqual({ message: "User registered" });
        done();
      });
  });

  it("should return 400 Bad Request when username is missing", (done) => {
    request(app)
      .post(SIGNUP_URI)
      .send({
        email: "",
        password: "",
      })
      .expect(400, done);
  });
});
