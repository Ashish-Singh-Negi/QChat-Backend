import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import FriendRepository from "../repositories/FirendRepository";

export default class FriendService {
  constructor(private friendRepo: FriendRepository) {}

  async getFriendProfile(id: string, filter = "") {
    const friendRecord = await this.friendRepo.findfriendById(
      id,
      ` -chats -friendRequests ${filter}`
    );
    if (!friendRecord)
      throw new NotFoundError({
        message: "Friend Profile Not Found",
      });

    return { friendProfile: friendRecord };
  }

  async removeFriend(userId: string, friendId: string) {
    // ! TODO
    console.log("TODO : implement Remove friend method");
  }
}
