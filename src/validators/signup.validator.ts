import Joi from "joi";

export const signupSchema = Joi.object({
  username: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().required(),
  confirmPassword: Joi.ref("password"),
});
