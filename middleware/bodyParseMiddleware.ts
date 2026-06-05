import { Request, Response, NextFunction } from "express";

export const ensureJsonBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.authMode === "signature" && req.gitHubPayload) {
    req.body = req.gitHubPayload;
    return next();
  }

  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyStr = req.body.toString("utf8");
      req.body = JSON.parse(bodyStr);
    } catch (err: any) {
      console.error(
        "[Body Parse Error] Failed to parse raw body as JSON:",
        err.message,
      );
      return res.status(400).json({
        type: "error",
        message: "Invalid JSON body provided.",
      });
    }
  }

  next();
};
