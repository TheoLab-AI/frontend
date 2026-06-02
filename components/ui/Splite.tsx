"use client";

import type { Application } from "@splinetool/runtime";
import { lazy, type ReactElement, type ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";

// Importamos el entrypoint cliente puro. El entrypoint `/next` es un async
// Server Component y NO se puede combinar con `lazy()` + Suspense del lado
// cliente (Next.js arroja "is an async Client Component"). Para nuestro caso
// el cliente puro funciona porque este wrapper ya está marcado como
// `"use client"` arriba.
const Spline = lazy(() => import("@splinetool/react-spline"));

interface SpliteSceneProps {
	scene: string;
	className?: string;
	fallback?: ReactNode;
	onLoad?: (app: Application) => void;
}

export function SpliteScene({
	scene,
	className,
	fallback,
	onLoad,
}: SpliteSceneProps): ReactElement {
	return (
		<Suspense
			fallback={
				fallback ?? (
					<div
						className={cn(
							"w-full h-full flex items-center justify-center bg-[var(--color-onyx)]",
							className,
						)}
					>
						<span className="text-mono text-[0.65rem] text-[var(--color-fg-muted)]">
							Cargando escena…
						</span>
					</div>
				)
			}
		>
			<Spline scene={scene} className={className} onLoad={onLoad} />
		</Suspense>
	);
}
