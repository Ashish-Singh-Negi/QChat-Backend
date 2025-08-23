import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import UserRepository from "../repositories/UserRepository";

export default class UserService {
  constructor(private userRepo: UserRepository) {}

  getUserById(userId: string, filter?: string) {
    return this.userRepo.findUserById(userId, filter);
  }

  public async getUserProfile(userId: string) {
    const userRecord = await this.userRepo.findUserById(userId, "-password");
    return { userProfile: userRecord };
  }

  public async searchWithUsername(username: string) {
    const userRecords = await this.userRepo.getAllUser();

    const usernames = userRecords.filter((userRecord) =>
      userRecord.username.toLowerCase().startsWith(username.toLowerCase())
    );

    return { usernames };
  }

  public async updateUserProfile(
    userId: string,
    dto: {
      profilePic: string;
      about: string;
    }
  ) {
    try {
      let updatedUserProfile;

      if (dto.about)
        updatedUserProfile = await this.userRepo.findByIdAndUpdate(userId, {
          about: dto.about,
        });

      if (dto.profilePic)
        updatedUserProfile = await this.userRepo.findByIdAndUpdate(userId, {
          about: dto.profilePic,
        });

      return { updatedUserProfile };
    } catch (error) {
      throw error;
    }
  }

  public async updateUserChatName(
    // TODO Refactor this method
    username: string,
    chatId: string,
    nickName: string
  ) {
    try {
      const updatedUserProfile = await this.userRepo.updateOne(
        { username: username, "chats.id": chatId },
        {
          "chats.$.name": nickName,
        }
      );

      if (!updatedUserProfile)
        throw new NotFoundError({ message: "User Chat not found" });
      return { updatedUserProfile };
    } catch (error) {
      throw error;
    }
  }
}
