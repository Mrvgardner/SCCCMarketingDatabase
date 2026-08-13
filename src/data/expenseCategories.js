export const expenseCategories = [
  "Airfare",
  "Lodging",
  "Meals",
  "Ground transportation",
  "Rental car",
  "Fuel",
  "Parking and tolls",
  "Baggage fees",
  "Conference and event fees",
  "Internet and phone",
  "Business supplies",
  "Other",
];

export function suggestExpenseCategory(text) {
  const value = String(text || "").toLowerCase();
  const rules = [
    ["Airfare", ["airlines", "airways", "flight", "southwest", "american airline", "delta air", "united air"]],
    ["Ground transportation", ["uber", "lyft", "taxi", "cab", "rideshare"]],
    ["Lodging", ["hotel", "resort", "inn", "marriott", "hilton", "hyatt", "paris las vegas"]],
    ["Rental car", ["hertz", "avis", "enterprise", "budget rent", "national car"]],
    ["Fuel", ["shell", "chevron", "exxon", "mobil", "fuel", "gasoline"]],
    ["Parking and tolls", ["parking", "parkmobile", "toll", "turnpike"]],
    ["Baggage fees", ["baggage", "checked bag", "luggage"]],
    ["Conference and event fees", ["conference", "convention", "registration", "expo"]],
    ["Internet and phone", ["internet", "wifi", "wireless", "verizon", "at&t", "t-mobile"]],
    ["Business supplies", ["office depot", "staples", "fedex office", "printing", "supplies", "bookstore", "books"]],
    ["Meals", ["restaurant", "cafe", "coffee", "grill", "kitchen", "bar", "doordash", "ubereats"]],
  ];
  return rules.find(([, terms]) => terms.some((term) => value.includes(term)))?.[0] || "Other";
}
