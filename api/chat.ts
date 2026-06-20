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

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content || "",
    }));

    const response = await client.chat.completions.create({
      model: "poolside/laguna-m1:free",
      messages: formattedMessages,
    });

    const aiText =
      response.choices?.[0]?.message?.content ||
      "No response generated";

    return res.status(200).json({
      text: aiText,
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return res.status(500).json({
      error: error?.message || "Server Error",
    });
  }
}
