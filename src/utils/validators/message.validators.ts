import Joi from "joi";
import BadRequestError from "../../errors/BadRequestError";

export const storeMessageSchema = Joi.object({
  senderId: Joi.string().required(),
  recipientId: Joi.string().required(),
  content: Joi.string().trim().required(),
  chatId: Joi.string().required(),
});

export const editMessageSchema = Joi.object({
  content: Joi.string().trim().required(),
});
