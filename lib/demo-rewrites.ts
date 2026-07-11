export type DemoScenario = {
  id: string;
  label: string;
  contact: string;
  draft: string;
  insight: string;
  options: string[];
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "boss",
    label: "Reply to your boss",
    contact: "Sarah (Manager)",
    draft: "I can't believe you scheduled another meeting on Friday. This is ridiculous.",
    insight:
      "Yikes. That reads like a resignation letter disguised as a calendar complaint. Let's keep the frustration, lose the HR meeting.",
    options: [
      "Hey Sarah — Friday's already packed on my end. Could we move this to Monday or keep it async?",
      "Quick heads up: I have a conflict Friday afternoon. Happy to catch up Monday morning if that works.",
      "I want to give this the attention it deserves — would Monday work better for a proper discussion?",
    ],
  },
  {
    id: "ex",
    label: "Text your ex",
    contact: "Alex",
    draft: "I saw you liked my friend's post. Are you trying to get my attention or what?",
    insight:
      "Classic 2am energy at 2pm. You're curious, not a detective. Let's make it human without the interrogation room vibes.",
    options: [
      "Hey — hope you're doing well. No agenda, just wanted to say hi.",
      "Saw you around online. Hope life's treating you kindly.",
      "Been thinking about reaching out. How have you been?",
    ],
  },
  {
    id: "mom",
    label: "Answer your mom",
    contact: "Mom",
    draft: "I KNOW. I'll call you. Stop texting me every hour.",
    insight:
      "Valid frustration. Invalid delivery method to the woman who gave you life. She loves you — she just has unlimited texting energy.",
    options: [
      "Love you mom! Swamped today but I'll call you tonight around 7.",
      "Sorry for the radio silence — crazy day. Free for a call this evening?",
      "You're right, I owe you a call. Tonight after dinner works — promise!",
    ],
  },
  {
    id: "group",
    label: "Group chat drama",
    contact: "Weekend Crew",
    draft: "Wow so I guess nobody wants me there. Cool. Whatever.",
    insight:
      "The passive-aggressive olympics called — they want their gold medal back. Let's express the hurt without launching a group chat civil war.",
    options: [
      "Hey! Didn't get the invite for Saturday — is it still happening? Would love to join if there's room.",
      "Saw some plans forming — count me in if you're still figuring things out!",
      "Miss hanging with you all. Let me know if Saturday's still on — I'm free!",
    ],
  },
];

export function matchScenario(draft: string): DemoScenario {
  const lower = draft.toLowerCase();

  if (/boss|manager|meeting|friday|work|schedule/.test(lower)) {
    return DEMO_SCENARIOS[0];
  }
  if (/ex|broke up|attention|liked|friend's post/.test(lower)) {
    return DEMO_SCENARIOS[1];
  }
  if (/mom|mother|call you|texting me|stop/.test(lower)) {
    return DEMO_SCENARIOS[2];
  }
  if (/nobody|group|invite|whatever|cool\./.test(lower)) {
    return DEMO_SCENARIOS[3];
  }

  return {
    id: "generic",
    label: "Any message",
    contact: "Someone important",
    draft,
    insight:
      "Your draft has some heat. Nothing wrong with having feelings — let's just make sure they land the way you intend, not the way they'll read at midnight.",
    options: [
      draft.replace(/!+/g, ".").replace(/\b(can't believe|ridiculous|whatever)\b/gi, "").trim() ||
        "Hey — wanted to follow up on this. Can we talk when you have a moment?",
      "Thanks for your patience. I'd like to share my thoughts when we can connect properly.",
      "I have some feelings about this — can we find a good time to talk it through?",
    ],
  };
}
