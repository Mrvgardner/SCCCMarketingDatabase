import { Link } from "react-router-dom";
import { ArrowLeftIcon, CakeIcon } from "@heroicons/react/24/solid";
import { birthdays } from "../data/celebrations";
import { getUpcoming, formatDate } from "../utils/celebrations";

export default function Birthdays() {
  const all = getUpcoming(birthdays, birthdays.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <CakeIcon className="h-10 w-10 text-[#ff4f00]" />
          <h1 className="font-switch-bold text-4xl bg-gradient-to-r from-[#ff4f00] to-[#ff7f50] bg-clip-text text-transparent">
            Upcoming Birthdays
          </h1>
        </div>
        <p className="text-gray-400 mb-10">
          {all.length} {all.length === 1 ? "birthday" : "birthdays"} on the calendar, sorted by what's next.
        </p>

        {all.length > 0 ? (
          <div className="space-y-2">
            {all.map((b) => {
              const isSoon = b.daysUntil <= 7;
              return (
                <div
                  key={b.name}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
                    isSoon
                      ? "bg-gradient-to-r from-[#ff4f00]/20 to-[#ff7f50]/10 border-[#ff4f00]/40"
                      : "bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSoon ? "bg-[#ff4f00]" : "bg-gray-700"}`}>
                      <CakeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{b.name}</div>
                      <div className="text-sm text-gray-400">
                        {b.daysUntil === 0
                          ? "Today!"
                          : b.daysUntil === 1
                          ? "Tomorrow"
                          : `In ${b.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatDate(b.next)}</div>
                    <div className="text-xs text-gray-400">
                      {b.next.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 bg-gray-800/40 rounded-xl">
            No birthdays found. The BambooHR feed may be empty.
          </div>
        )}
      </div>
    </div>
  );
}
