import { useState } from "react";
import Fuse from "fuse.js";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import ThemeToggle from "../components/ThemeToggle.jsx";

const assets = [
	{
		title: "Switch Branding Guide",
		type: "PDF",
		category: "Branding",
		tags: ["Logo", "Fonts", "Colors"],
		url: "/assets/branding/switch-branding-guide.pdf",
	},
	{
		title: "Clear Choice Sales Deck",
		type: "Deck",
		category: "Sales Materials",
		tags: ["Overview", "Sales"],
		url: "/assets/sales/clear-choice-sales-deck.pdf",
	},
];

const fuse = new Fuse(assets, {
	keys: ["title", "type", "category", "tags"],
	threshold: 0.3,
});

export default function Home() {
	const [query, setQuery] = useState("");
	const results = query ? fuse.search(query).map((r) => r.item) : assets;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<h1 className="text-3xl font-bold mb-4">Switch Team Portal</h1>
			<div className="flex justify-end mb-2">
				<ThemeToggle />
			</div>
			<Input
				placeholder="Search assets by keyword or tag..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="mb-6"
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{results.map((asset, index) => (
					<Card key={index}>
						<CardContent className="p-4">
							<h2 className="text-xl font-semibold">{asset.title}</h2>
							<p className="text-sm text-gray-500">
								{asset.type} • {asset.category}
							</p>
							<p className="text-sm mt-1">
								Tags: {asset.tags.join(", ")}
							</p>
							<a
								href={asset.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 mt-2 inline-block"
							>
								View / Download
							</a>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
