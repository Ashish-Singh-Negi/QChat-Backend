import Joi from "joi";

export const updateUserProfileSchema = Joi.object({
  about: Joi.string().trim().allow(""),
  profilePic: Joi.string(),
});
