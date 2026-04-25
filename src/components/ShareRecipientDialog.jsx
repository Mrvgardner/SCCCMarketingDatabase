import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function ShareRecipientDialog({ open, onClose, onSubmit, productTitle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      // Autofocus once the dialog has mounted
      setTimeout(() => nameInputRef.current?.focus(), 20);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-gray-900/95 border border-white/10 backdrop-blur-md shadow-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-1">
            <Dialog.Title className="font-switch-bold text-xl">Email this card</Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {productTitle && (
            <p className="text-sm text-gray-400 mb-5">
              Sharing: <span className="text-gray-200">{productTitle}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Recipient name
              </div>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-[#0951fa]/60 focus:outline-none focus:ring-1 focus:ring-[#0951fa]/50 text-white placeholder-gray-500"
              />
              <div className="text-[11px] text-gray-500 mt-1">
                We'll use the first word as the greeting — e.g. "Hi Jane,"
              </div>
            </label>

            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Recipient email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-[#0951fa]/60 focus:outline-none focus:ring-1 focus:ring-[#0951fa]/50 text-white placeholder-gray-500"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/15 via-45% to-gray-900/60 to-100% border border-[#0951fa]/50 hover:border-[#0951fa]/70 backdrop-blur-md shadow-lg transition-all"
              >
                Open email
              </button>
            </div>
            <div className="text-[11px] text-gray-500 text-center">
              Opens in your default email client and copies a styled version you can paste into the body.
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
