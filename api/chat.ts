import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    console.log("Request started");

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { messages } = req.body;

    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free",

      messages: messages.map((m: any) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content || "",
      })),

      max_tokens: 200,
      temperature: 0.7,
    });

    console.log("Response received");

    return res.status(200).json({
      text:
        response.choices?.[0]?.message?.content ||
        "No response generated",
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return res.status(500).json({
      error:
        error?.error?.message ||
        error?.message ||
        "Server Error",
    });
  }
}
