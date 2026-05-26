import Script from "next/script";
import type { ReactElement } from "react";

interface JsonLdProps {
	id: string;
	data: object | object[];
}

/**
 * JSON-LD structured data via next/script.
 * Server-generated from typed helpers in lib/seo.ts.
 */
export function JsonLd({ id, data }: JsonLdProps): ReactElement {
	return (
		<Script id={id} type="application/ld+json" strategy="beforeInteractive">
			{JSON.stringify(data).replace(/</g, "\\u003c")}
		</Script>
	);
}
