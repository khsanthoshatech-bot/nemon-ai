import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const { messages, model } = req.body;

    const response = await client.chat.completions.create({
      model: model || "openai/gpt-4o-mini",
      messages,
    });

    return res.status(200).json({
      text: response.choices[0].message.content,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
