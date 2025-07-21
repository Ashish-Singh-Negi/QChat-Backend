import Joi from "joi";

export const signinSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .trim()
    .required(),
});
