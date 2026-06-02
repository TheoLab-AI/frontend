import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
	{ href: "#services", label: "Servicios" },
	{ href: "#evidence", label: "Evidencia" },
	{ href: "#philosophy", label: "Filosofía" },
] as const;

export function InstitutionalNav() {
	return (
		<header className="border-b border-[var(--color-divider)]">
			<nav
				aria-label="Principal"
				className="container-brand flex items-center justify-between py-4"
			>
				<Link href="/" aria-label="Inicio">
					<Wordmark size="sm" />
				</Link>
				<div className="flex items-center gap-6">
					<ul className="hidden items-center gap-6 md:flex">
						{LINKS.map((l) => (
							<li key={l.href}>
								<Link
									href={l.href}
									className="text-meta text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
								>
									{l.label}
								</Link>
							</li>
						))}
					</ul>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/consultoria">Para firmas legales</Link>
					</Button>
				</div>
			</nav>
		</header>
	);
}
