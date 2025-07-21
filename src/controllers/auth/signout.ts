import { Request, Response } from "express";

const signoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access-token", {
      httpOnly: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export { signoutController };
