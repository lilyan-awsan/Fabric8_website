import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const router = express.Router();

router.post("/contact", (req, res, next) => {
  import("./contact.js").then(m => m.default(req, res, next)).catch(next);
});

router.post("/sendQuote", (req, res, next) => {
  import("./sendQuote.js").then(m => m.default(req, res, next)).catch(next);
});

router.post("/adminAuth", (req, res, next) => {
  import("./adminAuth.js").then(m => m.default(req, res, next)).catch(next);
});

router.post("/githubSync", (req, res, next) => {
  import("./githubSync.js").then(m => m.default(req, res, next)).catch(next);
});

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
