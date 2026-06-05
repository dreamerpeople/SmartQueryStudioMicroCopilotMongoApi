import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawApiKey = req.headers["x-api-key"];
  const apiKey = Array.isArray(rawApiKey) ? rawApiKey[0] : rawApiKey;
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (apiKey && expectedKey && apiKey === expectedKey) {
    if (!req.user) {
      req.user = {
        name: "Internal Service",
        username: "service_account@internal",
        isService: true,
      };
    }
    return next();
  }

  if (req.user) {
    return next();
  }

  res.status(401).json({
    error:
      "Not authenticated. This request must be signed by GitHub or provide a valid INTERNAL_API_KEY.",
  });
};
