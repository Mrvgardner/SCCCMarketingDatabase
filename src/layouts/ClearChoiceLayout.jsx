export default function ClearChoiceLayout({ children }) {
  return (
    <div className="bg-[#E8E7E7] min-h-screen text-[#002B5E]">
      <header className="bg-[#FF4F00] text-white p-4 flex items-center justify-center gap-4">
        <img src="/logos/clear-choice-logo.png" alt="Clear Choice Logo" className="h-10" />
        <h1 className="font-bold text-xl">Clear Choice Branding & Marketing</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}