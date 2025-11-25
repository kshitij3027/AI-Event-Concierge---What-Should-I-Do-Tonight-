import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventsRouter from "./routes/events.js";
import taxonomiesRouter from "./routes/taxonomies.js";
import { isComposioConfigured, getInitializationError } from "./services/composio.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/events", eventsRouter);
app.use("/api/taxonomies", taxonomiesRouter);

// Health check
app.get("/api/health", (_req, res) => {
  const composioConfigured = isComposioConfigured();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    composio_configured: composioConfigured,
    mode: composioConfigured ? "live" : "mock",
    message: composioConfigured 
      ? "Using live SeatGeek data via Composio"
      : "Using mock data - set COMPOSIO_API_KEY for live data",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
  });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  const composioConfigured = isComposioConfigured();
  console.log(`
🚀 Event Concierge API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Running at: http://localhost:${PORT}
📚 API Endpoints:
   - GET /api/health          - Health check
   - GET /api/events          - Search events
   - GET /api/events/:id      - Get event details
   - GET /api/taxonomies      - Get event categories

🔑 Composio API Key: ${composioConfigured ? "✓ Configured (Live Data)" : "✗ Missing (Mock Data Mode)"}
${!composioConfigured ? `
📌 To use live SeatGeek data:
   1. Get your API key from: https://app.composio.dev
   2. Create a .env file in the server/ directory
   3. Add: COMPOSIO_API_KEY=your_key_here
   4. Connect SeatGeek in your Composio dashboard
` : ""}
`);
});

