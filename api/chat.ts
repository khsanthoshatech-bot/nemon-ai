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

    const { messages, model } = req.body;

    const modelMap: Record<string, string> = {
      "nemon-flash": "openai/gpt-4o-mini",
      "nemon-pro": "qwen/qwen3-14b",
      "nemon-vision": "openai/gpt-4o-mini",
    };

    const actualModel =
      modelMap[model] || "openai/gpt-4o-mini";

    const response = await client.chat.completions.create({
      model: actualModel,
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
    console.error(error);

    return res.status(500).json({
      error: error?.message || "Server Error",
    });
  }
}
