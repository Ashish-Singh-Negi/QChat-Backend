import { CustomError } from "./CustomError";

export default class NotFoundError extends CustomError {
  private readonly _statusCode = 404;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: string };

  constructor(params: {
    message?: string;
    logging?: boolean;
    context?: { [key: string]: string };
  }) {
    const { message, logging } = params || {};

    super(message || "Not Found");

    this._logging = logging || false;
    this._context = params?.context || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  get errors() {
    return { message: this.message, context: this._context };
  }

  get statusCode() {
    return this._statusCode;
  }

  get logging() {
    return this._logging;
  }
}
