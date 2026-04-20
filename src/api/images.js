// Image upload helper — same dev/prod split as other API clients.

const ENDPOINT = "/.netlify/functions/images";
const DEV_KEY = "scc:dev-images";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return reject(new Error("Unexpected reader result"));
      const comma = result.indexOf(",");
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

async function devUpload(file) {
  // In dev the Netlify Function isn't running. Keep uploaded images as
  // data-URLs so the editor preview works end-to-end without a backend.
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  try {
    // Cap tiny localStorage cache so we don't blow the quota
    const cached = JSON.parse(localStorage.getItem(DEV_KEY) || "[]");
    cached.push({ name: file.name, at: Date.now() });
    localStorage.setItem(DEV_KEY, JSON.stringify(cached.slice(-20)));
  } catch {}
  return { url: dataUrl };
}

async function authHeaders() {
  const u = window.netlifyIdentity?.currentUser();
  if (!u) return {};
  try {
    return { Authorization: `Bearer ${await u.jwt()}` };
  } catch {
    return {};
  }
}

async function prodUpload(file) {
  const data = await fileToBase64(file);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify({
      contentType: file.type,
      filename: file.name,
      data,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${err}`);
  }
  return res.json();
}

export const uploadImage = import.meta.env.DEV ? devUpload : prodUpload;
