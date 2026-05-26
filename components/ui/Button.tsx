import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	[
		"inline-flex items-center justify-center gap-2",
		"font-sans font-medium text-ui",
		"transition-[background,color,border,transform] duration-300",
		"ease-[var(--ease-brand)]",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"[&_svg]:size-4 [&_svg]:shrink-0",
		"select-none whitespace-nowrap",
	].join(" "),
	{
		variants: {
			variant: {
				solid: [
					"bg-[var(--color-onyx)] text-[var(--color-alabaster)]",
					"hover:bg-[var(--color-burgundy)]",
					"active:translate-y-[1px]",
				].join(" "),
				outline: [
					"border border-[var(--color-divider)] bg-transparent",
					"text-[var(--color-fg)]",
					"hover:border-[var(--color-onyx)] hover:bg-[var(--color-bg-elevated)]",
					"active:translate-y-[1px]",
				].join(" "),
				ghost: [
					"bg-transparent text-[var(--color-fg)]",
					"hover:bg-[var(--color-bg-elevated)]",
				].join(" "),
				accent: [
					"bg-[var(--color-crimson)] text-[var(--color-alabaster)]",
					"hover:bg-[var(--color-burgundy)]",
					"active:translate-y-[1px]",
				].join(" "),
			},
			size: {
				sm: "h-9 px-3 text-[0.8125rem]",
				md: "h-11 px-5",
				lg: "h-12 px-6 text-[0.9375rem]",
			},
		},
		defaultVariants: {
			variant: "solid",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends ComponentPropsWithoutRef<"button">,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant, size, asChild = false, ...props },
	ref,
): ReactElement {
	const Comp = asChild ? Slot : "button";
	return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

export { buttonVariants };
