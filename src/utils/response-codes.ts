import { Response } from "express";

const httpStatus = {
  // Informational responses
  informational: (res: Response, message: string) => {
    res.status(100).json({ message });
  },

  // Success responses
  success: (res: Response, data: any, message: string) => {
    res.status(200).json({
      success: true,
      data,
      message,
    });
  },

  created: (res: Response, data: any, message: string) => {
    res.status(201).json({
      success: true,
      data,
      message,
    });
  },

  noContent: (res: Response) => {
    res.sendStatus(204);
  },

  // Redirection messages
  redirect: (res: Response, url: string, message: string) => {
    res.status(302).json({ message, redirectUrl: url });
  },

  // Client error responses
  badRequest: (res: Response, message: string) => {
    res.status(400).json({ error: message });
  },

  notFound: (res: Response, message: string) => {
    res.status(404).json({ error: message });
  },

  forbidden: (res: Response, message: string) => {
    res.status(403).json({ error: message });
  },

  // Server error responses
  internalServerError: (res: Response, message: string) => {
    console.error(message); // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error", message });
  },

  serviceUnavailable: (res: Response, message: string) => {
    res.status(503).json({ error: message });
  },

  // Added Conflict response
  conflict: (res: Response, message: string) => {
    res.status(409).json({ error: message });
  },
};

export default httpStatus;
