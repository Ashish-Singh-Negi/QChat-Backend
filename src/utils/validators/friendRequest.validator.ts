import Joi from "joi";
import BadRequestError from "../../errors/BadRequestError";

export const sendFriendRequestSchema = Joi.object({
  friendUsername: Joi.string().required(),
});
