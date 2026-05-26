import { cn } from "@/lib/utils";

interface WordmarkProps {
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
	as?: "h1" | "h2" | "div" | "span";
}

const sizeClasses: Record<NonNullable<WordmarkProps["size"]>, string> = {
	sm: "text-xl tracking-[-0.02em]",
	md: "text-3xl md:text-4xl tracking-[-0.025em]",
	lg: "text-5xl md:text-6xl tracking-[-0.03em]",
	xl: "text-display",
};

/**
 * TheoLab wordmark — "Theo" in onyx + "Lab" with painted crimson→gold gradient.
 * Brand v0.3 rule: Pascal-case, Inter Tight 700, gradient on "Lab".
 */
export function Wordmark({ className, size = "md", as: Tag = "span" }: WordmarkProps) {
	return (
		<Tag
			aria-label="TheoLab"
			className={cn(
				"inline-flex font-display font-bold leading-none [font-family:var(--font-display)]",
				"text-[var(--color-fg)]",
				sizeClasses[size],
				className,
			)}
		>
			<span className="text-current">Theo</span>
			<span className="text-brand-gradient">Lab</span>
		</Tag>
	);
}
