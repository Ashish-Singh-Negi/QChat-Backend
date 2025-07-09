import NotFoundError from "../errors/NotFoundError";
import FriendRepository from "../repositories/FirendRepository";

export default class FriendService {
  constructor(private friendRepo: FriendRepository) {}

  async getFriendProfile(id: string) {
    const friendRecord = await this.friendRepo.findfriendById(id, "-updatedAt");
    if (!friendRecord)
      throw new NotFoundError({
        message: "Friend Profile Not Found",
      });

    return { friendProfile: friendRecord };
  }

  async removeFriend(userId: string, friendId: string) {
    console.log(userId, " ", friendId);
  }
}
