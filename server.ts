import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

// Cache the OpenRouter client to avoid recreating it on every request
let openRouterClient: OpenAI | null = null;

function getOpenRouterClient() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  if (!openRouterClient) {
    openRouterClient = new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return openRouterClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // API Route: Get available models
  app.get("/api/models", (req, res) => {
    res.json([
      {
        id: "openai/gpt-4o-mini",
        name: "Nemon Flash",
        isDefault: true,
        capability: "Fast responses and coding"
      },
      {
        id: "qwen/qwen3-14b",
        name: "Nemon Pro",
        isDefault: false,
        capability: "Reasoning and analysis"
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Nemon Vision",
        isDefault: false,
        capability: "Advanced conversations"
      }
    ]);
  });

  // API Route: Stream chatbot replies (SSE)
  app.post("/api/chat", async (req, res) => {
    const { messages, model, systemInstruction } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const client = getOpenRouterClient();

    // Model mapping logic
    const modelMap: Record<string, string> = {
      "nemon-flash": "openai/gpt-4o-mini",
      "nemon-pro": "qwen/qwen3-14b",
      "nemon-vision": "meta-llama/llama-3.3-70b-instruct"
    };

    const activeModel =
      modelMap[model] ||
      "openai/gpt-4o-mini";

    // Debug Logs
    console.log("Requested Model:", model);
    console.log("Mapped Model:", activeModel);

    // Check if the developer has configured an API key
    if (!client) {
      const simulatedResponses = [
        "Nemon AI is running in demo mode. Configure OPENROUTER_API_KEY to enable live AI responses."
      ];

      for (const textChunk of simulatedResponses) {
        // Send simulated typing delay
        await new Promise((resolve) => setTimeout(resolve, 350));
        res.write(`data: ${JSON.stringify({ text: textChunk, mode: "simulation" })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    try {
      // Map frontend messages to standard OpenAI format with Vision support
      const formattedMessages = messages.map((m: any) => {
        const role =
          m.role === "assistant" || m.role === "model"
            ? "assistant"
            : "user";

        // Handle image attachments
        if (
          m.attachments &&
          Array.isArray(m.attachments) &&
          m.attachments.length > 0
        ) {
          const imageAttachment = m.attachments.find(
            (att: any) =>
              att.type &&
              att.type.startsWith("image/")
          );

          if (imageAttachment) {
            return {
              role,
              content: [
                {
                  type: "text",
                  text:
                    m.content ||
                    "Analyze this image in detail."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageAttachment.content
                  }
                }
              ]
            };
          }
        }

        return {
          role,
          content: m.content || ""
        };
      });

      // Inject system instruction if provided
      if (systemInstruction) {
        formattedMessages.unshift({
          role: "system",
          content: systemInstruction
        });
      }

      // Stream the response from OpenRouter
      const stream = await client.chat.completions.create({
        model: activeModel,
        messages: formattedMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;

        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("FULL ERROR");
      console.dir(err, { depth: null });

      res.write(
        `data: ${JSON.stringify({
          error: String(err?.message || err),
        })}\n\n`
      );

      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Serve static UI assets and handle spa-routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // @ts-ignore
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nemon AI Server booting on port ${PORT}...`);
  });
}

startServer();