import { CustomError } from "./CustomError";

export default class ConflictError extends CustomError {
  private static readonly _statusCode = 409;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: string };

  constructor(params: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: string };
  }) {
    const { code, message, logging } = params || {};

    super(message || "Conflict");

    this._code = code || ConflictError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  get errors() {
    return { message: this.message, context: this._context };
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
