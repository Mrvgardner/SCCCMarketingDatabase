export default function ClearChoiceLayout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <header className="bg-brand-orange text-white p-4 flex items-center justify-center gap-4">
        <img src="/logos/clear-choice-logo.png" alt="Clear Choice Logo" className="h-10" />
        <h1 className="font-bold text-xl">Clear Choice Branding & Marketing</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}