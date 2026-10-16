// The post-show survey's questions, shared by the screen that asks them and
// the function that checks and tallies the answers, so the two cannot drift.
//
// kind:    rating (1-5 stars), text, choice (pick one), multi (tick any)
// showIf:  asked only when an earlier answer is one of these, so someone who
//          did not use the app is asked why, not to rate features they never
//          opened. Answers to a question that was not shown are dropped.

const USED_IT = ["Yes", "A little"];

export const SURVEY_SECTIONS = [
  {
    title: "The show",
    questions: [
      { id: "show", kind: "rating", label: "Overall, how was the show for you?", required: true },
      { id: "traffic", kind: "rating", label: "How was booth traffic and lead quality?" },
      { id: "interest", kind: "text", label: "Which conversations or products got the most interest?" },
      { id: "differently", kind: "text", label: "What should we do differently next show?" },
    ],
  },
  {
    title: "The app",
    questions: [
      { id: "used", kind: "choice", label: "Did you use the app at this show?", options: ["Yes", "A little", "No"] },
      { id: "whyNot", kind: "text", label: "What got in the way of using it?", showIf: { id: "used", in: ["A little", "No"] } },
      { id: "app", kind: "rating", label: "How useful was the app?", showIf: { id: "used", in: USED_IT } },
      {
        id: "parts",
        kind: "multi",
        label: "Which parts did you use?",
        options: [
          "Agenda & flights",
          "Booth search",
          "Know this cold",
          "Brochures & Share",
          "Receipts (Money)",
          "Team contacts",
          "Ask (assistant)",
          "Map & directions",
        ],
        showIf: { id: "used", in: USED_IT },
      },
      { id: "confusing", kind: "text", label: "What was confusing or didn't work?", showIf: { id: "used", in: USED_IT } },
      { id: "add", kind: "text", label: "What one thing would you add?" },
    ],
  },
  {
    title: "Anything else",
    questions: [{ id: "else", kind: "text", label: "Anything else you want us to know?" }],
  },
];

export const SURVEY_QUESTIONS = SURVEY_SECTIONS.flatMap((section) => section.questions);

export function isShown(question, answers) {
  if (!question.showIf) return true;
  return question.showIf.in.includes(answers?.[question.showIf.id]);
}
