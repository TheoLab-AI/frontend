import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	[
		"inline-flex items-center gap-1.5",
		"font-sans font-medium",
		"text-[0.7rem] tracking-[0.08em] uppercase",
		"px-2.5 py-1",
		"select-none",
	].join(" "),
	{
		variants: {
			variant: {
				neutral:
					"bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] border border-[var(--color-divider)]",
				accent: "bg-[var(--color-burgundy)] text-[var(--color-alabaster)]",
				gold: "bg-[var(--color-gold)] text-[var(--color-onyx)]",
				outline: "border border-[var(--color-fg)] text-[var(--color-fg)] bg-transparent",
			},
		},
		defaultVariants: { variant: "neutral" },
	},
);

export interface BadgeProps
	extends ComponentPropsWithoutRef<"span">,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): ReactElement {
	return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
