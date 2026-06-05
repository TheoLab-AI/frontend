import type { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
			<header className="container-brand py-8">
				<a href="/" className="text-meta uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
					TheoLab
				</a>
			</header>
			{children}
		</div>
	);
}
