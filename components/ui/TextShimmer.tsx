"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef, CSSProperties, ElementRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "brand" | "crimson";

interface TextShimmerProps extends ComponentPropsWithoutRef<"span"> {
	variant?: Variant;
	asChild?: boolean;
	/** Duration of the shimmer slide animation in seconds. */
	duration?: number;
}

export const TextShimmer = forwardRef<ElementRef<"span">, TextShimmerProps>(function TextShimmer(
	{ variant = "brand", asChild = false, duration = 2.4, className, style, ...props },
	ref,
) {
	const Comp = asChild ? Slot : "span";
	const mergedStyle: CSSProperties = {
		...(style ?? {}),
		// Custom property — read by @utility text-shimmer-* in globals.css
		["--shimmer-duration" as string]: `${duration}s`,
	};
	return (
		<Comp
			ref={ref}
			className={cn(variant === "brand" ? "text-shimmer-brand" : "text-shimmer-crimson", className)}
			style={mergedStyle}
			{...props}
		/>
	);
});
