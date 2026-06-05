import express from "express";
import {
  handleQuery,
  handleTestAggregate,
  handleRawAggregateQuery,
  handleFixedQuery,
  handleAnalyticsQuery,
} from "../controllers/queryController";
import { authenticateAgent } from "../middleware/tokenMiddleware";
import { ensureJsonBody } from "../middleware/bodyParseMiddleware";

const router = express.Router();

router.post(
  "/query",
  express.raw({ type: "application/json" }),
  ensureJsonBody,
  handleQuery,
);

router.post(
  "/test-aggregate",
  express.raw({ type: "application/json" }),
  ensureJsonBody,
  handleTestAggregate,
);

router.post(
  "/execute-raw-aggregate",
  express.text({ type: "*/*" }),
  handleRawAggregateQuery,
);

router.get("/dashboard-summary", authenticateAgent, handleFixedQuery);

router.get("/analytics-summary", authenticateAgent, handleAnalyticsQuery);

export default router;
