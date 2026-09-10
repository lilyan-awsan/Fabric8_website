import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import contactHandler from "./contact.js";
import sendQuoteHandler from "./sendQuote.js";
import adminAuthHandler from "./adminAuth.js";
import githubSyncHandler from "./githubSync.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Support both /api/path and /path
const router = express.Router();
router.post("/contact", contactHandler);
router.post("/sendQuote", sendQuoteHandler);
router.post("/adminAuth", adminAuthHandler);
router.post("/githubSync", githubSyncHandler);

app.use("/api", router);
app.use("/", router);

export const api = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
    memory: "512MiB"
  },
  app
);
