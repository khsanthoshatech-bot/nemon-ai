import OpenAI from "openai";

export default async function handler(req: any, res: any) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed",
});
}

try {
console.log(
"Request Body:",
JSON.stringify(req.body, null, 2)
);

```
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

const actualModel =
  modelMap[model] || "openai/gpt-4o-mini";

console.log("Mapped Model:", actualModel);

const formattedMessages = messages.map((m: any) => {
  if (
    m.attachments &&
    Array.isArray(m.attachments) &&
    m.attachments.length > 0
  ) {
    const imageAttachment = m.attachments.find(
      (att: any) =>
        att.type &&
        att.type.startsWith("image/")
    );

    if (imageAttachment) {
      return {
        role:
          m.role === "model"
            ? "assistant"
            : "user",
        content: [
          {
            type: "text",
            text:
              m.content ||
              "Analyze this image.",
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
  }

  return {
    role:
      m.role === "model"
        ? "assistant"
        : "user",
    content: m.content || "",
  };
});

const response =
  await client.chat.completions.create({
    model: actualModel,
    messages: formattedMessages,
  });

const aiText =
  response.choices?.[0]?.message?.content ||
  "No response generated.";

console.log("AI Response:", aiText);

return res.status(200).json({
  text: aiText,
});
```

} catch (error: any) {
console.error("FULL ERROR:", error);

```
return res.status(500).json({
  error:
    error?.message ||
    "Unknown server error",
});
```

}
}
