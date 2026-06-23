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

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content || "",
    }));

    let response;

    try {
      console.log("Trying Model 1");

      response = await client.chat.completions.create({
        model: "nvidia/nemotron-3-super:free",
        messages: formattedMessages,
        max_tokens: 200,
        temperature: 0.7,
      });
    } catch (err) {
      console.log("Model 1 failed, trying Model 2");

      response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b:free",
        messages: formattedMessages,
        max_tokens: 200,
        temperature: 0.7,
      });
    }

    console.log("Response received");

    return res.status(200).json({
      text:
        response?.choices?.[0]?.message?.content ||
        "No response generated",
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        error:
          "Free model is busy. Please wait 30 seconds and try again.",
      });
    }

    return res.status(500).json({
      error:
        error?.error?.message ||
        error?.message ||
        "Server Error",
    });
  }
}
