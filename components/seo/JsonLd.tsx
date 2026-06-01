import type { ReactElement } from "react";

interface JsonLdProps {
	id: string;
	data: object | object[];
}

/**
 * JSON-LD structured data, emitted into the raw prerendered HTML.
 *
 * A plain <script> rendered by a Server Component is serialized into the
 * static HTML at ANY layout nesting level. We deliberately avoid next/script
 * `strategy="beforeInteractive"` here: it only reaches the static HTML from the
 * ROOT layout — once moved into a nested route-group layout it degrades to a
 * JS-injected tag (present only in the RSC flight payload), which crawlers that
 * don't execute JS never see.
 */
export function JsonLd({ id, data }: JsonLdProps): ReactElement {
	return (
		<script
			id={id}
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: structured data generated server-side from typed helpers in lib/seo.ts
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
		/>
	);
}
