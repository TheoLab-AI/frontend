import { Mail } from "lucide-react";
import { Wordmark } from "@/components/ui/Wordmark";
import { contact, mailtoUrl } from "@/lib/contact";

export function ConsultoriaFooter() {
	return (
		<footer className="bg-[var(--color-onyx)] text-[var(--color-alabaster)]">
			<div className="container-brand py-16 md:py-20">
				<div className="flex flex-col gap-8">
					<div className="flex flex-col gap-4">
						<Wordmark size="md" className="text-[var(--color-alabaster)]" />
						<a
							href={mailtoUrl()}
							className="
								inline-flex items-center gap-2 w-fit
								text-body text-[var(--color-alabaster)]/80
								transition-colors duration-300
								hover:text-[var(--color-gold)]
							"
						>
							<Mail className="h-4 w-4" aria-hidden="true" />
							{contact.email}
						</a>
					</div>

					<div className="pt-8 border-t border-[var(--color-alabaster)]/10">
						<span className="text-mono text-[0.7rem] text-[var(--color-alabaster)]/50">
							© {new Date().getFullYear()} TheoLab AI · Hecho en Colombia
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
