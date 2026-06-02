import { Mail } from "lucide-react";
import Link from "next/link";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/lib/tokens";

const NAV_LINKS = [
	{ href: "#hero", label: "Inicio" },
	{ href: "#services", label: "Servicios" },
	{ href: "#evidence", label: "Evidencia" },
	{ href: "#philosophy", label: "Filosofía" },
] as const;

export function Footer() {
	return (
		<footer className="bg-[var(--color-onyx)] text-[var(--color-alabaster)]">
			<div className="container-brand py-16 md:py-20">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-12">
					{/* Brand block */}
					<div className="md:col-span-5 flex flex-col gap-5">
						<Wordmark size="md" className="text-[var(--color-alabaster)]" />
						<p className="text-body text-[var(--color-alabaster)]/70 max-w-md [text-wrap:pretty]">
							{brand.subtitle}
						</p>
						<div className="flex items-center gap-3 pt-2">
							<a
								href={brand.github}
								target="_blank"
								rel="noreferrer noopener"
								aria-label="GitHub TheoLab-AI"
								className="
									inline-flex h-10 w-10 items-center justify-center
									border border-[var(--color-alabaster)]/15
									text-[var(--color-alabaster)]/70
									transition-colors duration-300
									hover:border-[var(--color-crimson)] hover:text-[var(--color-crimson)]
								"
							>
								<GithubIcon className="h-4 w-4" aria-hidden="true" />
							</a>
							<a
								href="mailto:admin@theolab.tech"
								aria-label="Email TheoLab"
								className="
									inline-flex h-10 w-10 items-center justify-center
									border border-[var(--color-alabaster)]/15
									text-[var(--color-alabaster)]/70
									transition-colors duration-300
									hover:border-[var(--color-crimson)] hover:text-[var(--color-crimson)]
								"
							>
								<Mail className="h-4 w-4" aria-hidden="true" />
							</a>
						</div>
					</div>

					{/* Navigation */}
					<nav aria-label="Footer navigation" className="md:col-span-3 flex flex-col gap-3">
						<span className="text-meta text-[var(--color-alabaster)]/50">Navegación</span>
						<ul className="flex flex-col gap-2">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="
											text-body text-[var(--color-alabaster)]/80
											transition-colors duration-300
											hover:text-[var(--color-gold)]
										"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Repos */}
					<div className="md:col-span-4 flex flex-col gap-3">
						<span className="text-meta text-[var(--color-alabaster)]/50">Open source</span>
						<ul className="flex flex-col gap-2">
							<li>
								<a
									href="https://github.com/TheoLab-AI/harness"
									target="_blank"
									rel="noreferrer noopener"
									className="
										text-body text-[var(--color-alabaster)]/80
										transition-colors duration-300
										hover:text-[var(--color-gold)]
									"
								>
									TheoLab-AI/harness
								</a>
								<span className="block text-mono text-[0.7rem] text-[var(--color-alabaster)]/40">
									v0.1.0 · evaluación de generadores IA
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-16 pt-8 border-t border-[var(--color-alabaster)]/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<span className="text-mono text-[0.7rem] text-[var(--color-alabaster)]/50">
						© {new Date().getFullYear()} TheoLab AI · Hecho en Colombia
					</span>
					<span className="text-mono text-[0.7rem] text-[var(--color-alabaster)]/50">
						v0.0.1 · INTELLIGENT AUTOMATION · COLOMBIA
					</span>
				</div>
			</div>
		</footer>
	);
}
