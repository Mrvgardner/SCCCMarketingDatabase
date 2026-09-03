import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getSearchInsights } from "../../api/productSearch";
import { Card, Eyebrow } from "./TripChrome";

// Admin only: what the team searched for at the booth, most-asked first, with
// the ones that found nothing called out. After a show this is the list of
// questions the catalogue could not answer — which is the content to write
// before the next one.

export default function SearchInsights() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSearchInsights()
      .then((result) => !cancelled && setData(result))
      .catch((loadError) => !cancelled && setError(loadError.message || "Could not load searches."));
    return () => { cancelled = true; };
  }, []);

  const queries = data?.queries || [];
  const misses = queries.filter((q) => q.misses > 0).length;

  return (
    <section>
      <Eyebrow>Searches at the booth</Eyebrow>
      <Card className="mt-3 p-4">
        {error && <p className="text-[12.5px] text-[#ef4444]">{error}</p>}
        {!error && !data && <p className="text-[13px] text-[#75808d]">Loading…</p>}

        {data && !queries.length && (
          <div className="flex gap-3">
            <MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#75808d]" />
            <p className="text-[13px] leading-[1.5] text-[#93a0b4]">
              Nothing searched yet. Once the team starts asking, this shows what they asked and
              what came up empty.
            </p>
          </div>
        )}

        {queries.length > 0 && (
          <>
            <p className="text-[12.5px] leading-[1.5] text-[#93a0b4]">
              <span className="font-semibold text-white">{data.total}</span> search{data.total === 1 ? "" : "es"}
              {misses > 0 && (
                <> · <span className="font-semibold text-[#f59e0b]">{misses}</span> question{misses === 1 ? "" : "s"} with no answer</>
              )}
            </p>
            <ul className="mt-3 divide-y divide-white/[0.06]">
              {queries.slice(0, 12).map((q) => (
                <li key={q.query} className="flex items-baseline gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-white">{q.query}</span>
                  {q.misses > 0 ? (
                    <span className="shrink-0 rounded px-1.5 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#f59e0b] bg-[#f59e0b]/10">
                      no answer
                    </span>
                  ) : null}
                  <span className="shrink-0 text-[12px] tabular-nums text-[#75808d]">×{q.count}</span>
                </li>
              ))}
            </ul>
            {queries.length > 12 && (
              <p className="mt-2 text-[11.5px] text-[#75808d]">Showing the 12 most asked of {queries.length}.</p>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
