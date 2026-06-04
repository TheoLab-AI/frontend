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
 * TheoLab wordmark — "Theo" hereda el color del contexto (currentColor) + "Lab"
 * con gradiente pintado crimson→gold. Brand v0.3: Pascal-case, Inter Tight 700,
 * gradiente en "Lab".
 *
 * "Theo" usa `currentColor` (no un color fijo) para adaptarse al tema del
 * contenedor: oscuro sobre el header/hero claros, alabaster sobre los onyx. Un
 * color fijo dejaba "Theo" invisible (oscuro sobre oscuro) en el header onyx de
 * /consultoria-legal. El contenedor define el color; pásalo por `className` si
 * el contexto no lo hereda.
 */
export function Wordmark({ className, size = "md", as: Tag = "span" }: WordmarkProps) {
	return (
		<Tag
			aria-label="TheoLab"
			className={cn(
				"inline-flex font-display font-bold leading-none [font-family:var(--font-display)]",
				sizeClasses[size],
				className,
			)}
		>
			<span className="text-current">Theo</span>
			<span className="text-brand-gradient">Lab</span>
		</Tag>
	);
}
