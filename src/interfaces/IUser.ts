export interface IUser {
  _id: string;
  username: string;
  password: string;
  email: string;
  profilePic: string;
  about: string;
  isOnline: boolean;
  starMessages: string[];
  chats: string[];
  friends: string[];
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
