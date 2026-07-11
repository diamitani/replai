import { createOpenAI } from "@ai-sdk/openai";

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export function getModel(
  name = process.env.LLM_MODEL || "deepseek-chat"
) {
  return deepseek(name);
}

export function getDeepSeekProvider() {
  return deepseek;
}
