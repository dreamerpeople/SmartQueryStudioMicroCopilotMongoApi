import { Request, Response, NextFunction } from "express";

export async function authenticateAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.get("Authorization");
  const apiKey = req.get("x-api-key") || authHeader?.replace("Bearer ", "");
  const expectedKey = process.env.AGENT_API_KEY || process.env.INTERNAL_API_KEY;

  if (apiKey && expectedKey && apiKey === expectedKey) {
    req.user = {
      name: "Authenticated User",
      role: "admin",
      provider: "api_key",
    };
    req.authMode = "api_key";
    return next();
  }

  return res.status(401).json({
    type: "error",
    message: "Unauthorized: Please provide a valid 'x-api-key' header.",
  });
}

export {
  authenticateAgent as verifyGitHubSignature,
  authenticateAgent as authenticateCopilot,
  authenticateAgent as authenticateGemini,
};
