// Return the next N upcoming celebrations, sorted by how soon they occur.
// Handles wrap-around at year boundary.

export function getUpcoming(items, count = 3, today = new Date()) {
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();

  const withDaysUntil = items.map((item) => {
    const [month, day] = item.date.split("-").map(Number);
    let occurrenceYear = currentYear;
    if (month < todayMonth || (month === todayMonth && day < todayDay)) {
      occurrenceYear = currentYear + 1;
    }
    const next = new Date(occurrenceYear, month - 1, day);
    const daysUntil = Math.round((next - today) / (1000 * 60 * 60 * 24));
    return { ...item, next, daysUntil };
  });

  return withDaysUntil
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, count);
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function yearsOfService(startYear, next) {
  return next.getFullYear() - startYear;
}
