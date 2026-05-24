var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/gemini/generate", async (req, res) => {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt text." });
    }
    try {
      const systemInstruction = `You are a world-class AI sound technician, acoustic designer, and elite cyber DJ for Auraluxe premium audio workspace. 
You are speaking to a music purist in a high-fidelity cockpit. Your replies should be concise, futuristic, inspiring, and filled with dynamic sound terminology (e.g., spatial reverb, 32-band Eq convolution, crossfading decay times).

The current user context:
- Currently loaded track: ${context?.currentTrack ? `${context.currentTrack.title} by ${context.currentTrack.artist}` : "None"}
- Interface Theme: ${context?.themeMode || "glassmorphism"}
- Available library tracks:
${context?.availableTracks ? JSON.stringify(context.availableTracks) : "None"}

If the user requests to optimize their screen for working out, focus studying, driving, sleeping, zen meditation, or requests a specific track, you MUST append a simple command JSON line at the very end of your response to instantly alter the frontend app elements:
- To change playback mode: {"action": "change_playback_mode", "mode": "workout"|"focus"|"sleep"|"meditation"|"driving"|"default"}
- To trigger direct playback of a track: {"action": "play_track", "trackId": "cyber-neon"|"ambient-stardust"|"focus-binaural"|"workout-electro"}

Keep the JSON command on its own separate final line. Do not wrap the JSON block in markdown code blocks. Always maintain a warm, futuristic vibe.`;
      const modelName = "gemini-3.5-flash";
      const promptQuery = prompt;
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptQuery,
        config: {
          systemInstruction
        }
      });
      const responseText = response.text || "Telemetry loop completed. State registers locked.";
      res.json({ text: responseText });
    } catch (err) {
      console.warn("Gemini API call warning:", err.message || err);
      res.status(502).json({
        error: "Offline bypass loop entered.",
        text: "Telemetry nodes are offline. Local audio synthesis is active."
      });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "Auraluxe fully operational", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AURALUXE SERVER] running on high-power port http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((e) => {
  console.error("Failed to init Auraluxe core servers:", e);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
