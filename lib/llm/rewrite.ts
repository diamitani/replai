import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "./models";
import { recordUsage, type UsageRecordResult } from "./usage";

const RewriteSchema = z.object({
  options: z.array(z.string()).length(3),
});

export type RewriteResult = {
  options: string[];
  usage: UsageRecordResult;
};

export async function rewriteMessage(
  draft: string,
  contactRules: string,
  history: string
): Promise<RewriteResult> {
  const { object, usage } = await generateObject({
    model: getModel(),
    schema: RewriteSchema,
    system: `You rewrite text messages to fit the sender's rules for this contact.
Keep the sender's voice natural and conversational — like iMessage, not corporate email.
Return exactly 3 distinct rewrite options with different tones/approaches.

Contact rules:
${contactRules || "No specific rules set."}

Recent conversation context:
${history || "No prior messages."}`,
    prompt: draft,
  });

  const promptTokens = usage.inputTokens ?? 0;
  const completionTokens = usage.outputTokens ?? 0;
  const usageRecord = await recordUsage(promptTokens, completionTokens);

  return {
    options: object.options,
    usage: usageRecord,
  };
}
