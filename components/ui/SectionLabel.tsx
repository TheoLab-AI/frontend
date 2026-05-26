import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
	index: string;
	label: string;
	className?: string;
}

/**
 * Editorial section label — mimics brand v0.3 pagination style
 * (e.g. "01 · SERVICES", "02 · EVIDENCE").
 */
export function SectionLabel({ index, label, className }: SectionLabelProps): ReactElement {
	return (
		<div
			className={cn(
				"flex items-center gap-3 font-sans text-meta",
				"text-[var(--color-fg-muted)]",
				className,
			)}
		>
			<span className="text-mono text-[0.7rem]">{index}</span>
			<span aria-hidden="true">·</span>
			<span>{label}</span>
		</div>
	);
}

interface SectionHeadingProps {
	children: ReactNode;
	className?: string;
}

export function SectionHeading({ children, className }: SectionHeadingProps): ReactElement {
	return (
		<h2 className={cn("text-headline text-[var(--color-fg)] max-w-3xl", className)}>{children}</h2>
	);
}
