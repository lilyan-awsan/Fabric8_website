import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const router = express.Router();

// Dynamic Asset Fallback Proxy: streams newly uploaded site & product images directly from GitHub if not yet cached on CDN
router.get(["/assets/site_images/*", "/assets/products/*"], async (req, res) => {
  try {
    const rawPath = req.path.replace(/^\/api/, "");
    const ghUrl = `https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main${rawPath}`;
    const ghRes = await fetch(ghUrl);
    if (!ghRes.ok) {
      return res.status(404).send("Image not found");
    }
    const contentType = ghRes.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    const arrayBuffer = await ghRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Asset Fallback Proxy Error:", err);
    return res.status(500).send("Error fetching asset");
  }
});

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
