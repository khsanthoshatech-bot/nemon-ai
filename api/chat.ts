import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  // Handle CORS
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
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing in Vercel Environment Variables.",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://nemon-ai.vercel.app",
        "X-Title": "Nemon AI",
      },
    });

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required.",
      });
    }

    const formattedMessages = messages.map((m: any) => ({
      role:
        m.role === "model"
          ? "assistant"
          : m.role === "assistant"
          ? "assistant"
          : "user",
      content: m.content || "",
    }));

    const models = [
      "nvidia/nemotron-3-super:free",
      "openai/gpt-oss-120b:free",
      "deepseek/deepseek-r1:free",
      "meta-llama/llama-3.3-70b-instruct:free",
    ];

    let response: any = null;
    let lastError: any = null;

    for (const model of models) {
      try {
        console.log("Trying:", model);

        response = await client.chat.completions.create({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 512,
        });

        console.log("Success:", model);
        break;
      } catch (err) {
        console.error("Failed:", model);
        lastError = err;
      }
    }

    if (!response) {
      return res.status(500).json({
        error: lastError?.message || "All AI models failed.",
      });
    }

    return res.status(200).json({
      success: true,
      model: response.model,
      text:
        response.choices?.[0]?.message?.content ??
        "No response generated.",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      error:
        error?.error?.message ||
        error?.message ||
        "Internal Server Error",
    });
  }
}
