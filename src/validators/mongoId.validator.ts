import { isValidObjectId } from "mongoose";
import BadRequestError from "../errors/BadRequestError";

export function validateObjectId(id: string, idName?: string) {
  if (!isValidObjectId(id))
    throw new BadRequestError({
      message: `Invalid ${idName ? idName : " id"}`,
    });
}
