import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	images: {
		formats: ["image/avif", "image/webp"],
	},
	async redirects() {
		// La landing legal se renombró /consultoria → /consultoria-legal.
		// 301 permanente: preserva SEO y enlaces existentes.
		return [
			{
				source: "/consultoria",
				destination: "/consultoria-legal",
				permanent: true,
			},
		];
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "motion"],
	},
};

export default nextConfig;
