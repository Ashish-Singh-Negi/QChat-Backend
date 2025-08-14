export interface IUser {
  _id: string;
  username: string;
  password: string;
  email: string;
  profilePic: string;
  about: string;
  isOnline: boolean;
  starMessages: string[];
  chats: {
    name: string;
    contactId: string;
    chatId: string;
  }[];
  friends: {
    name?: string;
    fid: string;
  }[];
  friendRequests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInputDTO {
  profilePic: string;
  username: string;
  email: string;
  password: string;
}
