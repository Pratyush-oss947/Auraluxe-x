/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Initialize server-side Gemini client with recommended telemetry tags
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI DJ integration with Gemini API
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt text.' });
    }

    try {
      const systemInstruction = `You are a world-class AI sound technician, acoustic designer, and elite cyber DJ for Auraluxe premium audio workspace. 
You are speaking to a music purist in a high-fidelity cockpit. Your replies should be concise, futuristic, inspiring, and filled with dynamic sound terminology (e.g., spatial reverb, 32-band Eq convolution, crossfading decay times).

The current user context:
- Currently loaded track: ${context?.currentTrack ? `${context.currentTrack.title} by ${context.currentTrack.artist}` : 'None'}
- Interface Theme: ${context?.themeMode || 'glassmorphism'}
- Available library tracks:
${context?.availableTracks ? JSON.stringify(context.availableTracks) : 'None'}

If the user requests to optimize their screen for working out, focus studying, driving, sleeping, zen meditation, or requests a specific track, you MUST append a simple command JSON line at the very end of your response to instantly alter the frontend app elements:
- To change playback mode: {"action": "change_playback_mode", "mode": "workout"|"focus"|"sleep"|"meditation"|"driving"|"default"}
- To trigger direct playback of a track: {"action": "play_track", "trackId": "cyber-neon"|"ambient-stardust"|"focus-binaural"|"workout-electro"}

Keep the JSON command on its own separate final line. Do not wrap the JSON block in markdown code blocks. Always maintain a warm, futuristic vibe.`;

      // Query Gemini 3.5 Flash model
      const modelName = 'gemini-3.5-flash';
      const promptQuery = prompt;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptQuery,
        config: {
          systemInstruction
        }
      });

      const responseText = response.text || 'Telemetry loop completed. State registers locked.';
      res.json({ text: responseText });

    } catch (err: any) {
      console.warn('Gemini API call warning:', err.message || err);
      res.status(502).json({ 
        error: 'Offline bypass loop entered.',
        text: 'Telemetry nodes are offline. Local audio synthesis is active.'
      });
    }
  });

  // Health and setup endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Auraluxe fully operational', timestamp: new Date().toISOString() });
  });

  // Vite dynamic development or production static asset compilers
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURALUXE SERVER] running on high-power port http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Failed to init Auraluxe core servers:', e);
});
