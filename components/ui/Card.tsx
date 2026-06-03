import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
	[
		"relative",
		// Brand spec: esquinas casi rectas — radius forzado.
		"rounded-none",
		"transition-[background,border-color] duration-300",
		"ease-[var(--ease-brand)]",
	].join(" "),
	{
		variants: {
			variant: {
				default: [
					"border border-[var(--color-divider)]",
					"bg-[var(--color-bg)] text-[var(--color-fg)]",
				].join(" "),
				dark: ["border-0", "bg-[var(--color-onyx)] text-[var(--color-alabaster)]"].join(" "),
			},
			padding: {
				none: "p-0",
				sm: "p-4",
				md: "p-6",
				lg: "p-8",
			},
			overflow: {
				visible: "",
				hidden: "overflow-hidden",
			},
		},
		defaultVariants: {
			variant: "default",
			padding: "md",
			overflow: "visible",
		},
	},
);

export interface CardProps
	extends ComponentPropsWithoutRef<"div">,
		VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
	{ className, variant, padding, overflow, ...props },
	ref,
): ReactElement {
	return (
		<div
			ref={ref}
			className={cn(cardVariants({ variant, padding, overflow, className }))}
			{...props}
		/>
	);
});

export { cardVariants };
