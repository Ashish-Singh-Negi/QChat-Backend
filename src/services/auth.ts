import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import BadRequestError from "../errors/BadRequestError";
import ConflictError from "../errors/ConflictError";
import UserRepository from "../repositories/UserRepository";
import { IUser, IUserInputDTO } from "../utils/interfaces/IUser";

const ACCESS_TOKEN_EXP = 1000 * 60 * 15;
const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7;

export default class AuthService {
  constructor(private userRepo: UserRepository) {}

  public async Signup(userInputDTO: IUserInputDTO) {
    console.log(userInputDTO);
    try {
      const isUserAlreadyRegistered: any = await this.userRepo.findOne(
        {
          username: userInputDTO.username,
        },
        true
      );
      console.log(isUserAlreadyRegistered);
      if (isUserAlreadyRegistered)
        throw new ConflictError({ message: "User already Register" });

      console.log("hashing password");
      const hashPassword = await bcrypt.hash(userInputDTO.password, 12);

      const userRecord = await this.userRepo.createUser({
        ...userInputDTO,
        password: hashPassword,
      });
      if (!userRecord) throw new Error("User cannot be created!");

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, "password");
      return { user };
    } catch (error) {
      throw error;
    }
  }

  public async SignIn(username: string, password: string) {
    try {
      const userRecord: any = await this.userRepo.findOne(
        {
          username: username,
        },
        true
      );
      if (!userRecord)
        throw new BadRequestError({
          message: "Invalid credentials",
          context: {
            explanation: "username or password is invalid",
          },
        });

      const isPasswordMatch = await bcrypt.compare(
        password,
        userRecord.password
      );
      if (!isPasswordMatch)
        throw new BadRequestError({
          message: "Invalid credentials",
          context: {
            explanation: "username or password is invalid",
          },
        });

      Reflect.deleteProperty(userRecord, "password");
      const access_token = this.generateAccessToken(userRecord);
      const refresh_token = this.generateRefreshToken(userRecord);

      return { user: userRecord, access_token, refresh_token };
    } catch (error) {
      throw error;
    }
  }

  public refreshToken(user: Partial<IUser>) {
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);

    return { access_token, refresh_token };
  }

  generateAccessToken(user: Partial<IUser>) {
    const access_token = jwt.sign(
      {
        _id: user._id,
        name: user.username,
      },
      config.jwtSecret as string,
      {
        expiresIn: ACCESS_TOKEN_EXP,
      }
    );

    return access_token;
  }

  generateRefreshToken(user: Partial<IUser>) {
    const refresh_token = jwt.sign(
      {
        _id: user._id,
        name: user.username,
      },
      config.jwtSecret as string,
      {
        expiresIn: REFRESH_TOKEN_EXP,
      }
    );

    return refresh_token;
  }
}
