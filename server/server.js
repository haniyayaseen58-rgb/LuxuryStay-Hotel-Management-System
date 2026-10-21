const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

// Optional (local development): some Windows setups make Node send DNS
// queries to a resolver that refuses the SRV lookup mongodb+srv:// needs.
// e.g. DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(",").map((server) => server.trim())
  );
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");

const missingEnv = [
  !MONGO_URI && "MONGO_URI (or MONGODB_URI)",
  !process.env.JWT_SECRET && "JWT_SECRET",
].filter(Boolean);

if (missingEnv.length) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_URL: comma-separated list of allowed frontend origins.
// When unset, all origins are allowed (auth uses Bearer tokens, not cookies).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);
app.use(express.json());

// Express 5 leaves req.body undefined when a request has no body
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Strip credentials from anything that might contain a connection string
const redact = (text) =>
  String(text || "").replace(/\/\/[^/@\s]+@/g, "//<credentials>@");

// Host and database name only, never the username or password
const describeMongoTarget = (uri) => {
  const match = /^(mongodb(?:\+srv)?):\/\/(?:[^@/]*@)?([^/?]+)(?:\/([^?]*))?/.exec(
    uri || ""
  );

  return match
    ? `${match[1]}://${match[2]}/${match[3] || "(no database name)"}`
    : "(invalid or missing connection string)";
};

const classifyMongoError = (error) => {
  const text = `${error.message} ${error.cause?.message || ""}`;

  if (!MONGO_URI) {
    return {
      reason: "missing-connection-string",
      hint: "Set MONGO_URI in the environment (Vercel: Project Settings -> Environment Variables).",
    };
  }

  if (/querySrv|_mongodb\._tcp/.test(text)) {
    return {
      reason: "dns-srv-lookup-failed",
      hint: "DNS could not resolve the Atlas SRV record. Locally, set DNS_SERVERS=8.8.8.8,1.1.1.1 in server/.env.",
    };
  }

  if (/bad auth|Authentication failed|auth failed/i.test(text)) {
    return {
      reason: "authentication-failed",
      hint: "Atlas rejected the database username/password in the connection string.",
    };
  }

  if (/not authorized|Unauthorized/i.test(text)) {
    return {
      reason: "not-authorized",
      hint: "The Atlas database user lacks readWrite permission on the luxurystay database.",
    };
  }

  if (
    error.name === "MongoServerSelectionError" ||
    /whitelist|IP address|ECONNRESET|ETIMEDOUT|timed out/i.test(text)
  ) {
    return {
      reason: "server-unreachable",
      hint: "Could not reach Atlas. Check Atlas Network Access allows this server's IP (Vercel needs 0.0.0.0/0).",
    };
  }

  return {
    reason: "unknown",
    hint: "See the error details above.",
  };
};

let lastDbError = null;

// Reuse one connection across requests (and across warm serverless
// invocations); retry on the next request if a previous attempt failed.
let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        lastDbError = null;
        console.log(
          `MongoDB Connected Successfully (${describeMongoTarget(MONGO_URI)})`
        );
      })
      .catch((error) => {
        connectionPromise = null;
        lastDbError = classifyMongoError(error);
        console.error("MongoDB Connection Error:", {
          target: describeMongoTarget(MONGO_URI),
          name: error.name,
          code: error.code ?? error.cause?.code,
          message: redact(error.message),
          cause: redact(error.cause?.message),
          reason: lastDbError.reason,
          hint: lastDbError.hint,
        });
        throw error;
      });
  }

  return connectionPromise;
};

connectDB().catch(() => {});

// Public status check; reports the failure category only, never secrets
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.json({
      success: true,
      database: "connected",
      databaseName: mongoose.connection.db?.databaseName,
    });
  } catch {
    res.status(503).json({
      success: false,
      database: "unavailable",
      reason: lastDbError?.reason || "unknown",
    });
  }
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({
      success: false,
      message: "Database is unavailable. Please try again shortly.",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LuxuryStay Backend API is running successfully!",
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// Return JSON (not Express's HTML page) for upload and other errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Document file must be 5MB or smaller."
          : error.message,
    });
  }

  if (error.message?.startsWith("Only JPG")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Unhandled Error:", error);

  return res.status(error.status || 500).json({
    success: false,
    message: "Server error. Please try again.",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LuxuryStay server running on port ${PORT}`);
  });
}

module.exports = app;
