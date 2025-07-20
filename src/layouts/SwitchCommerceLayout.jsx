import ThemeToggle from "../components/ThemeToggle";

export default function SwitchCommerceLayout({ children }) {
  return (
    <div className="bg-[#E8E7E7] min-h-screen text-[#002B5E]">
      <header className="bg-[#0951FA] text-white p-4 flex items-center justify-center gap-4">
        <img src="/logos/switch-commerce-logo.png" alt="Switch Commerce Logo" className="h-10" />
        <h1 className="font-bold text-xl">Switch Commerce Branding & Marketing</h1>
      </header>
      <div className="flex justify-end mb-2">
        <ThemeToggle />
      </div>
      <main className="p-6">{children}</main>
    </div>
  );
}