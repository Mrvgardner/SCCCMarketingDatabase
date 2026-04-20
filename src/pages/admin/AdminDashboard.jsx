import { Link } from "react-router-dom";
import { BookOpenIcon, NewspaperIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

const CARDS = [
  {
    to: "/admin/products",
    title: "Knowledge Base",
    description: "Add, edit, or remove product cards shown in the Knowledge Base.",
    icon: BookOpenIcon,
    gradient: "from-[#0951fa] to-[#0a7cff]",
    shadow: "shadow-[#0951fa]/20",
  },
  {
    to: "/admin/field-notes",
    title: "Field Notes",
    description: "Publish team announcements, updates, and news.",
    icon: NewspaperIcon,
    gradient: "from-[#5fae4b] to-[#7bc966]",
    shadow: "shadow-[#5fae4b]/20",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2 text-white">Admin</h1>
        <p className="text-gray-400 mb-10">Pick what you want to manage.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CARDS.map(({ to, title, description, icon: Icon, gradient, shadow }) => (
            <Link
              key={to}
              to={to}
              className={`group block rounded-2xl p-6 bg-gradient-to-br ${gradient} shadow-xl ${shadow} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{description}</p>
              <div className="mt-4 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                Manage →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
