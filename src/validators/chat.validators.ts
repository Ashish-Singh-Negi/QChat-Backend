import Joi from "joi";

export const createChatSchema = Joi.object({
  fid: Joi.string().required().trim(),
});

export const updateChatDisappearingDurationSchema = Joi.object({
  disappearingMessagesDuration: Joi.string()
    .valid("24 hours", "7 days", "1 month", "OFF")
    .required(),
});
