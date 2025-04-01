// express.d.ts
import { Request } from "express";

declare module "express" {
  export interface Request {
    uid?: string; // Add your custom property here
  }
}
