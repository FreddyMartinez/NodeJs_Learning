const API_PATH = '/api/v1';

export const SIGNUP_URI = API_PATH + '/users';

export const USER_MESSAGES = {
  USERNAME_REQUIRED: "Username is required",
  USERNAME_MIN_LENGTH: "Username must have at least 4 characters",
  USERNAME_MAX_LENGTH: "Username must have a maximum of 32 characters",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_NOT_VALID: "Email is invalid",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Password must have at least 5 characters",
  PASSWORD_FORMAT: "Password must have at least 1 lowercase, 1 uppercase and 1 number",
};
