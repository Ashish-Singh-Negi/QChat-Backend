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
    const userRecord = await this.userRepo.findUserById(userId);

    if (dto.about) userRecord.about = dto.about;
    if (dto.profilePic) userRecord.profilePic = dto.profilePic;

    const updatedUserProfile = await userRecord.save();
    return { updatedUserProfile };
  }

  public async searchWithUsername(username: string) {
    const userRecords = await this.userRepo.getAllUser("username");

    const usernames = userRecords.filter((userRecord) =>
      userRecord.username.toLowerCase().startsWith(username.toLowerCase())
    );

    return { usernames };
  }
}
