// How the site is laid out, for the assistant.
//
// The briefing tells the assistant what the site knows; this tells it how
// the site works, so "where do I enter my emergency contact?" gets a screen
// name and a button, not a shrug. Written by hand, because the honest
// description of a screen is not something the code can produce.
//
// Keep this in step with the app: when a screen moves or a button is renamed,
// the assistant is wrong until this says so.

export const appGuide = {
  site: {
    name: "switchcommerce.team (Team Switch Commerce)",
    signIn: "Employees sign in with their Switch Commerce account. Admins have an extra role that unlocks the admin pages and admin-only sections below.",
    assistant: "This assistant is the sparkle button in the bottom-right corner of every page. It answers from the site's own data; it cannot change anything.",
  },

  // The marketing site: the top navigation on the web.
  pages: [
    { path: "/", name: "Home", what: "Landing page with the latest field notes and quick links to the Knowledge Base, brand kits, brochures, signatures, wallpapers, and Marketing Request." },
    { path: "/products", name: "Knowledge Base", what: "Every Switch Commerce and Clear Choice product as a card: the problem it solves, the talking point, detail, who it is for. Search box, filters by company and type, and card, list, column, table, or grouped views. Open a card for the full write-up; Email and Copy buttons share it. Electronic Journal shows only the hand-off instruction." },
    { path: "/field-notes", name: "Field Notes", what: "Team updates, announcements, and news from marketing." },
    { path: "/switch-commerce/branding", name: "Switch Commerce Brand Kit", what: "Logos, colors, fonts, and usage guidelines for Switch Commerce." },
    { path: "/clear-choice/branding", name: "ClearChoice Brand Kit", what: "Logos, colors, fonts, and usage guidelines for Clear Choice." },
    { path: "/print-collateral", name: "Brochures & One-Pagers", what: "Every current brochure and one-pager with a thumbnail and a PDF link, grouped by company. 'Show archived documents' reveals older pieces." },
    { path: "/email-signature", name: "Email Signatures", what: "Build and copy a company email signature." },
    { path: "/wallpapers", name: "Wallpapers", what: "Branded desktop and phone wallpapers to download." },
    { path: "/marketing-request", name: "Marketing Request", what: "The form for asking marketing for something (collateral, design, campaigns). Questions go to marketing@switchcommerce.com." },
    { path: "/events", name: "Trade Shows", what: "The trade show hub: upcoming shows with 'Open event' to go into a show's trip app, and a past-event archive. In the top nav it is under Other." },
    { path: "/birthdays", name: "Birthdays", what: "Team birthdays." },
    { path: "/anniversaries", name: "Anniversaries", what: "Team work anniversaries." },
    { path: "/admin", name: "Admin", adminOnly: true, what: "Admins only. Manage the Knowledge Base cards, Field Notes, and Trade Shows (edit an event's schedule, team, hotel, resources, updates)." },
  ],

  // The trip app: one per show, at /trip/<show>/<tab>, with a tab bar along
  // the bottom. On a phone this can be installed to the home screen as
  // "Trade Shows", and it is what the iOS app contains.
  tripApp: {
    where: "Open a show from Trade Shows (/events) with 'Open event'. Six tabs along the bottom: Today, Trip, Money, Booth, Team, More.",
    tabs: [
      {
        tab: "Today",
        what: "The show at a glance: days until it starts, a 'Trip readiness' checklist (registered, hotel, flight added, expense capture), the countdown to what is next on the schedule once the show has started, and the first thing to do on the ground.",
      },
      {
        tab: "Trip",
        what: "Your flights, the hotel and venue, and the dress code for each day.",
        howTo: [
          "Add or change your flight: Trip tab, 'Your flights', tap 'Add your flight' (or 'Edit flight'). Enter the flight number and date for the arrival and the departure, tap 'Find flight' to fill in the airline and times, then 'Save flight info'. Flights save under your own name only.",
          "The Today tab's readiness checklist also has an 'Add' link that opens the same form.",
        ],
      },
      {
        tab: "Money",
        what: "Your expenses for this show: the running total, each receipt, and the trip report.",
        howTo: [
          "Add a receipt: Money tab, 'Snap a receipt'. Take a photo; it reads the merchant, date, category, and total automatically and uploads when you have signal.",
          "Each receipt is marked Review until you check the amounts and confirm it. Tap a receipt to edit the fields.",
          "When every receipt is confirmed, 'Finalize trip report' downloads your expense report with the receipt images for reimbursement.",
          "You see only your own receipts here. Admins see the team's totals through this assistant.",
        ],
      },
      {
        tab: "Booth",
        what: "What you need while standing at the booth: a search box ('What did they just ask you?') that finds the product card for a customer's question and tells you which brochure or one-pager to hand them ('Hand them this'); the 'Know this cold' pinned list; the venue map and directions to the booth; and Resources, including a 'Brochures' list that opens any current one-pager or brochure PDF.",
        howTo: [
          "Send a customer a brochure or one-pager: tap 'Share' next to it (in 'Hand them this', the Brochures list, or a pinned link). It sends the PDF file itself through Messages, Mail, AirDrop and so on, never a link to this site. On a computer it saves the file to attach to an email.",
          "Find what to say about a product: type the topic in the Booth search box. The card opens with 'Say this', 'If they ask more', and 'Who it's for'.",
          "Pin something to 'Know this cold' (admins only): Booth tab, '+ Note' or 'File' next to the Know this cold heading. 'Notify the team' sends a push notification when it is pinned.",
        ],
      },
      {
        tab: "Team",
        what: "Everyone traveling to this show, with call and text buttons. Admins can also open each person to see their flights and their emergency contact.",
      },
      {
        tab: "More",
        what: "Latest updates for the show (mark read/unread), the post-show archive once the show is over, your emergency contact, device settings, and links back to all trade shows. Admins also see 'Searches at the booth' and 'Manage event'.",
        howTo: [
          "Enter or change your emergency contact: More tab, 'Emergency contact' section, tap 'Add an emergency contact' (or 'Edit'), fill in their name, relationship, phone, and anything the team should know, then 'Save'. Only you and the event managers (admins) can see it.",
          "Install the app on your phone or turn on notifications: More tab, 'This device'. 'Add Trade Shows to your Home Screen' walks through the steps; 'Enable notifications' turns on push alerts for schedule reminders, pins, and flight changes. On iPhone, notifications only work after the app is on the home screen.",
          "Edit the show itself (admins only): More tab, 'Manage event'.",
        ],
      },
    ],
  },

  // Who can see what. The assistant should be able to tell someone why they
  // cannot see a thing, not just that they cannot.
  permissions: [
    "Anyone signed in sees every page except Admin, and in the trip app sees the schedule, the team with phone numbers, pins, resources, and their own flights, receipts, and emergency contact.",
    "Admins additionally see everyone's flights and emergency contacts on the Team tab, team expense totals through this assistant, booth search insights, Manage event, and the Admin pages.",
    "Flights are entered by each traveler for themselves. Emergency contacts likewise.",
  ],
};
