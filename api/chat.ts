import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    console.log("API Key Exists:", !!process.env.OPENROUTER_API_KEY);
    console.log("Request Body:", JSON.stringify(req.body));

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { messages, model } = req.body;

    const modelMap: Record<string, string> = {
      "nemon-flash": "openai/gpt-4o-mini",
      "nemon-pro": "qwen/qwen3-14b",
      "nemon-vision": "meta-llama/llama-3.3-70b-instruct",
    };

    const activeModel =
      modelMap[model] || "openai/gpt-4o-mini";

    console.log("Requested Model:", model);
    console.log("Mapped Model:", activeModel);

    const formattedMessages = messages.map((m: any) => ({
      role:
        m.role === "model"
          ? "assistant"
          : m.role === "assistant"
          ? "assistant"
          : "user",
      content: m.content || "",
    }));

    const response = await client.chat.completions.create({
      model: activeModel,
      messages: formattedMessages,
    });

    return res.status(200).json({
      text:
        response.choices?.[0]?.message?.content ||
        "No response generated",
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: error?.message || "Unknown server error",
    });
  }
}
