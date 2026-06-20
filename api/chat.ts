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
      "nemon-flash": "meta-llama/llama-3.2-3b-instruct:free",
      "nemon-pro": "google/gemma-3-4b-it:free",
      "nemon-vision": "meta-llama/llama-3.2-11b-vision-instruct:free",
    };

    const actualModel =
      modelMap[model] || "meta-llama/llama-3.2-3b-instruct:free";

    console.log("ACTUAL MODEL:", actualModel);

    console.log(
      "MESSAGES:",
      JSON.stringify(messages, null, 2)
    );

    const response = await client.chat.completions.create({
      model: actualModel,
      messages: messages.map((m: any) => {
        const role =
          m.role === "model"
            ? "assistant"
            : "user";

        const imageAttachment =
          m.attachments?.find(
            (a: any) =>
              a.type &&
              a.type.startsWith("image/")
          );

        if (
          imageAttachment &&
          imageAttachment.content
        ) {
          return {
            role,
            content: [
              {
                type: "text",
                text:
                  m.content?.trim() ||
                  "Describe this image in detail."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageAttachment.content,
                },
              },
            ],
          };
        }

        return {
          role,
          content: m.content || "",
        };
      }),
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
