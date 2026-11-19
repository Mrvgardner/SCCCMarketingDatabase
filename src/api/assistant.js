import { apiUrl } from "./apiBase";
import { sendAssistantRequest } from "./assistant-session.mjs";

const ENDPOINT = apiUrl("/.netlify/functions/assistant");
const useDev = import.meta.env.DEV;

// One turn of the conversation. `messages` is the whole exchange so far, the
// new question last; the server keeps no state between calls.
export async function askAssistant(messages, { eventId = "", user } = {}) {
  if (useDev) {
    // No gateway credentials locally. Say so rather than fake a reply.
    return {
      answer: "The assistant answers on the deployed site, not in local development. These sample links show how a real answer points at things.",
      links: [
        { label: "MultiFunction Kiosk one-pager", url: "/pdfs/CC-MultiFunction-Kiosk-One-Pager.pdf" },
        { label: "Open the Knowledge Base", url: "/products" },
      ],
      followUps: [],
    };
  }

  const response = await sendAssistantRequest({ user, endpoint: ENDPOINT, messages, eventId });

  const text = await response.text().catch(() => "");
  if (!response.ok) {
    let message = "";
    try {
      message = JSON.parse(text)?.error || "";
    } catch { /* not JSON */ }
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return JSON.parse(text);
}
