export default function SwitchCommerceLayout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <header className="bg-blue-600 text-white p-4 flex items-center justify-center gap-4">
        <img src="/logos/switch-commerce-logo.png" alt="Switch Commerce Logo" className="h-10" />
        <h1 className="font-bold text-xl">Switch Commerce Branding & Marketing</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}