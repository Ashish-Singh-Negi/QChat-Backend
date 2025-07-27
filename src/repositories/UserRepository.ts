import { ClientSession } from "mongoose";
import User from "../models/User";
import BaseRepository from "./BaseRepository";
import { IUserInputDTO } from "../utils/interfaces/IUser";

const TAILWIND_COLORS = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export default class UserRepository extends BaseRepository<typeof User> {
  constructor(private userModel: typeof User) {
    super(userModel);
  }

  createUser(userDTO: Partial<IUserInputDTO>) {
    const profilePicColor = TAILWIND_COLORS[Math.floor(Math.random() * 22)];
    const profilePicBgColor = `bg-${profilePicColor}-950 text-${profilePicColor}-300`;

    return this.userModel.create({
      ...userDTO,
      profilePic: profilePicBgColor,
    });
  }

  getAllUser(query = "username profilePic", limit = 10) {
    return this.userModel.find().select(`${query}`).limit(limit).lean();
  }

  findUserById(id: string, filter = "-password -__v", session?: ClientSession) {
    return session
      ? this.userModel.findById(id).select(`${filter}`).session(session)
      : this.userModel.findById(id).select(`${filter}`).lean();
  }

  findByUsername(
    username: string,
    filter = "-password -__v",
    session?: ClientSession
  ) {
    return session
      ? this.userModel
          .findOne({ username: username })
          .select(`${filter}`)
          .session(session)
      : this.userModel
          .findOne({ username: username })
          .select(`${filter}`)
          .lean();
  }

  findOneAndUpdateUserFriendRequestsByRemovingRID(
    username: string,
    rid: string,
    session: ClientSession
  ) {
    return this.userModel
      .findOneAndUpdate(
        { username: username },
        {
          $pull: { friendRequests: rid },
        }
      )
      .session(session);
  }

  updateOne(filter: any, data: any) {
    return this.userModel.updateOne(filter, {
      $set: {
        ...data,
      },
    });
  }
}
