export interface IChat {
  _id: string;
  participants: string[];
  messages: string[];
  pinMessages: string[];
  disappearingMessages: "24h" | "7d" | "1m" | "OFF";
  createdAt: Date;
  updatedAt: Date;
}
