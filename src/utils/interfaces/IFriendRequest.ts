export interface IfriendRequest {
  _id: string;
  sender: {
    username: string;
    profilePic: string;
  };
  recipient: {
    username: "kafal G";
    profilePic: string;
  };
  status: "pending";
  sendAt: Date;
}
