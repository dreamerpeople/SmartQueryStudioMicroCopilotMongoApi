import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      authMode?: string;
      gitHubPayload?: any;
    }
  }
}

export {};
