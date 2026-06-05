import "dotenv/config";
import express from "express";
import cors from "cors";
import { verifyGitHubSignature } from "./middleware/tokenMiddleware";
import connectDB from "./config/db";
import queryRouter from "./routes/query";
import authRouter from "./routes/auth";

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4040;

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3002", "http://localhost:4200"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);

// Skip JSON parsing for the raw aggregate execution endpoint to allow
// passing plain text MongoDB query strings (e.g. db.collection(...).aggregate(...)).
app.use(
  express.json({
    type: (req: any) => {
      const path = req.path || req.originalUrl || "";
      if (
        typeof path === "string" &&
        path.startsWith("/api/execute-raw-aggregate")
      )
        return false;
      const ct = (req.headers && req.headers["content-type"]) || "";
      return typeof ct === "string" && ct.includes("application/json");
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Smart Query Studio Copilot API",
    time: new Date().toISOString(),
  });
});

app.use("/auth", authRouter);
app.use("/api", queryRouter);

app.get("/api/protected", verifyGitHubSignature, (req, res) => {
  res.json({
    message: "Succesfully verified GitHub signature in the background.",
    auth_info: {
      type: "GitHub Copilot Extension",
      payload: req.gitHubPayload,
    },
    data: {
      id: "SQS-001",
      val: "This data is secured by GitHub Signature Verification.",
      timestamp: Date.now(),
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(`[Server Error] ${new Date().toISOString()}:`, err.stack);
    res.status(500).json({
      type: "error",
      message: "Internal server error.",
      debug: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

app.listen(PORT, () => {
  console.log(`\n🚀 GitHub API running at http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Extension endpoint: http://localhost:${PORT}/api/query`);
  console.log(`🔑 Auth endpoints: http://localhost:${PORT}/auth/user\n`);

  if (!process.env.COPILOT_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
    console.warn(
      "⚠️  WARNING: COPILOT_API_KEY or AZURE_OPENAI_API_KEY is not set in .env!",
    );
  }
});
