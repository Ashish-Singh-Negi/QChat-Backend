import BadRequestError from "../errors/BadRequestError";
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

  public async searchWithUsername(username: string) {
    const userRecords = await this.userRepo.getAllUser("username");

    const usernames = userRecords.filter((userRecord) =>
      userRecord.username.toLowerCase().startsWith(username.toLowerCase())
    );

    return { usernames };
  }
}
