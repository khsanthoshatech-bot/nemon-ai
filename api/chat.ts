import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { messages } = req.body;

    const response = await client.chat.completions.create({
      model: "nvidia/llama-nemotron-ultra-253b-v1:free",
      messages: messages.map((m: any) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content || "",
      })),
    });

    return res.status(200).json({
      text:
        response.choices?.[0]?.message?.content ||
        "No response generated",
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Server Error",
    });
  }
}
