import { NextFunction, Request, Response } from "express";
import httpStatus from "../../../utils/response-codes";
import FriendRequest from "../../../models/FriendRequest";
import User from "../../../models/User";
import expressAsyncHandler from "express-async-handler";
import FriendRequestService from "../../../services/friendRequest";
import BadRequestError from "../../../errors/BadRequestError";
import FriendRequestRepository from "../../../repositories/FriendRequestRepository";
import UserRepository from "../../../repositories/UserRepository";

const getFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    if (!rid) return httpStatus.badRequest(res, "Request Id is required");

    const friendRequestInstance = new FriendRequestService(
      new FriendRequestRepository(FriendRequest),
      new UserRepository(User)
    );
    const request = await friendRequestInstance.getFriendRequest(rid);

    return httpStatus.success(res, request, "successed");
  }
);

const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { friendUsername } = req.body;
    const senderUsername = req.name;

    if (!friendUsername)
      throw new BadRequestError({ message: "friend username is required" });

    const friendRequestServiceInstance = new FriendRequestService(
      new FriendRequestRepository(FriendRequest),
      new UserRepository(User)
    );

    const { sender, recipient } =
      await friendRequestServiceInstance.sendFriendRequest(
        senderUsername!,
        friendUsername
      );

    return httpStatus.success(
      res,
      { from: sender, to: recipient },
      "Friend request sent successfully."
    );
  }
);

const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    if (!rid) throw new BadRequestError({ message: "request id is required" });

    const friendRequestInstance = new FriendRequestService(
      new FriendRequestRepository(FriendRequest),
      new UserRepository(User)
    );

    const { friendRequest } = await friendRequestInstance.acceptFriendRequest(
      rid
    );

    return httpStatus.success(
      res,
      { friendRequest },
      "Friend request accepted successfully."
    );
  }
);

const rejectFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    if (!rid) throw new BadRequestError({ message: "request id is required" });

    const friendRequestInstance = new FriendRequestService(
      new FriendRequestRepository(FriendRequest),
      new UserRepository(User)
    );

    await friendRequestInstance.rejectFriendRequest(rid);

    return httpStatus.noContent(res);
  }
);

export {
  getFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
};
