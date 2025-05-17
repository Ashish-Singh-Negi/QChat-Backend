import { Request, Response } from "express";
import httpStatus from "../../utils/response-codes";
import User from "../../models/User";

const getProfile = async (req: Request, res: Response) => {
  try {
    console.log(req.url);

    const { uid } = req;

    const { filter } = req.query;

    console.log("Profile filter ", filter);

    if (filter) {
      if (typeof filter === "string") {
        try {
          const data = await User.findById(uid).select(`${filter} -_id`).lean();

          return httpStatus.success(res, data, "Filtered Profile");
        } catch (error) {
          console.error(error);
        }
      }
    }

    const userProfile = await User.findById(uid).select("-password").lean();

    if (!userProfile) return httpStatus.redirect(res, "/login", "Unauthorized");

    return httpStatus.success(res, userProfile, "Profile Found");
  } catch (error) {
    console.error(error);
    return httpStatus.internalServerError(res, "Internal Server Error :(");
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { uid } = req;
    if (!uid) return httpStatus.forbidden(res, "unauthorized user");

    const { about, profilePic } = req.body;

    if (!about && !profilePic)
      return httpStatus.badRequest(res, "data is required to change Profile");

    const userProfile = await User.findById(uid).select("-password");

    if (about) {
      userProfile.about = about;
    }

    if (profilePic) {
      userProfile.profilePic = profilePic;
    }

    await userProfile.save();

    return httpStatus.success(res, userProfile, "Profile Updated successfully");
  } catch (error) {
    console.error(error);
  }
};

export { getProfile, updateProfile };
