import OpenAI from "openai";

const MODELS = [
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-235b-a22b:free",
];

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OPENROUTER_API_KEY is missing from Vercel Environment Variables.",
      });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://nemon-ai-kh-santhosh-s-projects.vercel.app",
        "X-Title": "Nemon AI",
      },
    });

    const { messages = [], systemInstruction } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "messages must be an array",
      });
    }

    const formattedMessages: any[] = [];

    if (systemInstruction) {
      formattedMessages.push({
        role: "system",
        content: systemInstruction,
      });
    }

    for (const m of messages) {
      formattedMessages.push({
        role:
          m.role === "model"
            ? "assistant"
            : m.role === "assistant"
            ? "assistant"
            : "user",
        content: m.content ?? "",
      });
    }

    let response: any = null;
    let lastError: any = null;

    for (const model of MODELS) {
      try {
        console.log("Trying:", model);

        response = await client.chat.completions.create({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1024,
        });

        console.log("Success:", model);

        break;
      } catch (err: any) {
        console.error(model, err?.message);

        lastError = err;
      }
    }

    if (!response) {
      return res.status(500).json({
        error:
          lastError?.message ||
          "All models failed.",
      });
    }

    return res.status(200).json({
      success: true,
      model: response.model,
      text:
        response.choices?.[0]?.message?.content ??
        "No response",
    });
  } catch (err: any) {
    console.error("FULL ERROR");
    console.dir(err, {
      depth: null,
    });

    return res.status(err?.status || 500).json({
      success: false,
      error:
        err?.error?.message ||
        err?.message ||
        "Internal Server Error",
    });
  }
}
