import type { MetadataRoute } from "next";
import { brand } from "@/lib/tokens";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = `https://${brand.domain}`;
	return [
		{
			url: base,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${base}/consultoria-legal`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
	];
}
