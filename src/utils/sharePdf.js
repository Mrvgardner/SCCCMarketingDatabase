import { collateral } from "../data/collateral";

// Hand a customer a brochure or one-pager as the file itself.
//
// The rule this exists to keep: a customer must never be given a way into
// switchcommerce.team. So nothing here shares a link. The PDF is fetched and
// passed to the phone's share sheet (Messages, Mail, AirDrop, WhatsApp) as an
// attachment, with no URL and no text beside it, and it arrives under a
// readable name. Where a device cannot share files, it is saved instead, to be
// attached by hand.

const cache = new Map();

// "Clear Choice - MultiFunction Kiosk - Fall 2026.pdf" rather than the
// site's internal file name.
export function shareFileName(url) {
  const path = String(url || "").split("?")[0];
  const item = collateral.find((entry) => entry.url.split("?")[0] === path);
  const base = item
    ? [item.company === "Both" ? "Switch Commerce & Clear Choice" : item.company, item.name.replace(/^(Switch Commerce|Clear Choice)\s*/i, "")]
        .filter(Boolean)
        .join(" - ")
    : path.split("/").pop().replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
  return `${base.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim() || "Document"}.pdf`;
}

export function isPdf(url) {
  return /\.pdf$/i.test(String(url || "").split("?")[0]);
}

// Start fetching before the tap lands (on touch or hover), so the share sheet
// can open inside the tap. Safari refuses to open it if the tap is too long
// ago, and a 2 MB download can be.
export function prepareFile(url) {
  if (!cache.has(url)) {
    const pending = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load that document.");
        return response.blob();
      })
      .then((blob) => new File([blob], shareFileName(url), { type: "application/pdf" }))
      .catch((error) => {
        cache.delete(url);
        throw error;
      });
    cache.set(url, pending);
  }
  return cache.get(url);
}

function canShareFiles(file) {
  try {
    return Boolean(navigator.canShare && navigator.share && navigator.canShare({ files: [file] }));
  } catch {
    return false;
  }
}

// Returns what happened, so the button can say so:
//   "shared" | "cancelled" | "retry" (file ready, tap again) | "saved"
export async function sharePdf(url) {
  const file = await prepareFile(url);

  if (canShareFiles(file)) {
    try {
      // Files and a title only. A url or text field would put the site's
      // address in the message.
      await navigator.share({ files: [file], title: file.name.replace(/\.pdf$/i, "") });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      // The download outlasted the tap. The file is ready now, so the next
      // tap opens the sheet straight away.
      if (error?.name === "NotAllowedError") return "retry";
      throw error;
    }
  }

  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 30_000);
  return "saved";
}
