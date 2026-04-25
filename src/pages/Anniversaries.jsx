import { Link } from "react-router-dom";
import { ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { anniversaries } from "../data/celebrations";
import { getUpcoming, formatDate, yearsOfService } from "../utils/celebrations";

export default function Anniversaries() {
  const all = getUpcoming(anniversaries, anniversaries.length);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="h-10 w-10 text-[#9333ea]" />
          <h1 className="font-switch-bold text-3xl sm:text-4xl bg-gradient-to-r from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent">
            Upcoming Anniversaries
          </h1>
        </div>
        <p className="text-gray-400 mb-10">
          {all.length} {all.length === 1 ? "anniversary" : "anniversaries"} on the calendar, sorted by what's next.
        </p>

        {all.length > 0 ? (
          <div className="space-y-2">
            {all.map((a) => {
              const years = yearsOfService(a.startYear, a.next);
              const isSoon = a.daysUntil <= 7;
              const isMilestone = years > 0 && years % 5 === 0;
              return (
                <div
                  key={a.name}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
                    isSoon
                      ? "bg-gradient-to-r from-[#9333ea]/20 to-[#c084fc]/10 border-[#9333ea]/40"
                      : "bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSoon ? "bg-[#9333ea]" : "bg-gray-700"
                      }`}
                    >
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{a.name}</span>
                        {isMilestone && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#ff4f00] to-[#ff7f50] text-white">
                            MILESTONE
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {years} {years === 1 ? "year" : "years"} ·{" "}
                        {a.daysUntil === 0
                          ? "Today!"
                          : a.daysUntil === 1
                          ? "Tomorrow"
                          : `In ${a.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatDate(a.next)}</div>
                    <div className="text-xs text-gray-400">
                      {a.next.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 bg-gray-800/40 rounded-xl">
            No anniversaries found. The BambooHR feed may be empty.
          </div>
        )}
      </div>
    </div>
  );
}
