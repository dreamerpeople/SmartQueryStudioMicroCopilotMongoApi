import express from "express";
import { authenticateAgent } from "../middleware/tokenMiddleware";

const router = express.Router();

router.get("/user", authenticateAgent, (req, res) => {
  if (req.user) {
    return res.json({
      success: true,
      user: req.user,
    });
  }

  return res.status(401).json({
    error: "Not authenticated",
    message: "This endpoint requires a valid API Key.",
  });
});

export default router;
