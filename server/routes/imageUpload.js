// Session-authenticated image-upload proxy. The client sends a base64 image
// here and the server forwards it to ImgBB using a server-side API key, so the
// key never ships in the browser bundle. Only logged-in users can upload.

import cors from "cors";
import express from "express";
import { uploadLimiter } from "../middleware/rateLimit.js";
import logger from "../utils/logger.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB, matching the client-side check
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export function registerImageUpload(app) {
  const corsMw = cors({ origin: CLIENT_URL, credentials: true });

  // Preflight (dev is cross-origin :5173 → :4000 with credentials).
  app.options("/api/upload/image", corsMw);

  app.post(
    "/api/upload/image",
    corsMw,
    uploadLimiter,
    express.json({ limit: "8mb" }), // base64 inflates ~33%; 5MB → ~6.7MB
    async (req, res) => {
      try {
        if (typeof req.isAuthenticated !== "function" || !req.isAuthenticated()) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
          return res.status(503).json({ error: "Image upload is not configured" });
        }

        const { image, type } = req.body || {};
        if (typeof image !== "string" || !image) {
          return res.status(400).json({ error: "No image provided" });
        }
        if (type && !VALID_TYPES.includes(type)) {
          return res.status(400).json({ error: "Invalid file type" });
        }
        // Enforce the size limit on the decoded byte count, not the base64 length.
        const approxBytes = Math.floor((image.length * 3) / 4);
        if (approxBytes > MAX_BYTES) {
          return res.status(413).json({ error: "Image must be less than 5MB" });
        }

        const form = new URLSearchParams();
        form.append("image", image);

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: form,
        });
        const data = await imgbbRes.json();

        if (data?.success && data?.data?.url) {
          return res.json({ url: data.data.url });
        }

        logger.error("ImgBB upload failed", { status: imgbbRes.status });
        return res.status(502).json({ error: "Upload failed" });
      } catch (err) {
        logger.error("Image upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }
    }
  );
}
