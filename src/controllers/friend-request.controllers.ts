import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import httpStatus from "../utils/response-codes";
import FriendRequestService from "../services/friendRequest.service";
import FriendRequestRepository from "../repositories/FriendRequestRepository";
import FriendRequest from "../models/FriendRequest";
import User from "../models/User";
import UserRepository from "../repositories/UserRepository";
import BadRequestError from "../errors/BadRequestError";
import { validateObjectId } from "../validators/mongoId.validator";

/**
 * GET /friends/requests/:rid
 * req-body {}
 */
const getFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    validateObjectId(rid, "request Id");

    const friendRequestInstance = new FriendRequestService(
      new FriendRequestRepository(FriendRequest),
      new UserRepository(User)
    );
    const friendRequest = await friendRequestInstance.getFriendRequest(rid);

    return httpStatus.success(res, friendRequest, "successed");
  }
);

/**
 * POST /friends/requests
 * req-name : "apple"        // req-name is added when user is authorized
 * req-body {
 *  friendUsername : "mango",
 * }
 */
const sendFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { friendUsername } = req.body;
    const senderUsername = req.name;

    if (friendUsername === senderUsername)
      throw new BadRequestError({
        message: "user can not send friend request to itself",
        context: {
          explanation: "sender and recipent username are same",
        },
      });

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

/**
 *  PATCH /friends/requests/:rid/accept
 * req-body {}
 */
const acceptFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    validateObjectId(rid, "request Id");

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

/**
 * PATCH /friends/requests/:rid/reject
 * req-body {}
 */
const rejectFriendRequest = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { rid } = req.params;
    validateObjectId(rid, "request Id");

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
