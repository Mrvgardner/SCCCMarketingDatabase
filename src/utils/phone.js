export function phoneDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function formatPhoneInput(value) {
  const digits = phoneDigits(value).slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatPhoneNumber(value) {
  const digits = phoneDigits(value);
  if (digits.length !== 10) return String(value || "").trim();
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function phoneLinkValue(value) {
  const digits = phoneDigits(value);
  if (!digits) return "";
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}
