import type { MetadataRoute } from "next";
import { brand } from "@/lib/tokens";

export default function robots(): MetadataRoute.Robots {
	const base = `https://${brand.domain}`;
	return {
		rules: [{ userAgent: "*", allow: "/" }],
		sitemap: `${base}/sitemap.xml`,
		host: base,
	};
}
