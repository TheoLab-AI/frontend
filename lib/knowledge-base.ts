import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

const KB_DIR = path.join(process.cwd(), "docs", "knowledge-base");

let cachedKb: string | null = null;

export async function loadKnowledgeBase(): Promise<string> {
	if (cachedKb !== null) return cachedKb;

	const files = await fs.readdir(KB_DIR);
	const ordered = files.filter((f) => f.endsWith(".md")).sort();

	const parts = await Promise.all(
		ordered.map(async (filename) => {
			const content = await fs.readFile(path.join(KB_DIR, filename), "utf-8");
			return `\n\n=== ${filename} ===\n\n${content.trim()}`;
		}),
	);

	cachedKb = parts.join("\n");
	return cachedKb;
}
