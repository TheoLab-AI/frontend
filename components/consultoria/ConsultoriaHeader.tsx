import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { whatsappUrl } from "@/lib/contact";

const WHATSAPP_TEXT = "Hola, quiero agendar la reunión de introducción para mi firma.";

export function ConsultoriaHeader() {
	return (
		<header className="border-b border-[var(--color-divider)]">
			<div className="container-brand flex items-center justify-between py-4">
				<Link href="/consultoria" aria-label="TheoLab — Consultoría">
					<Wordmark size="sm" />
				</Link>
				<Button variant="accent" size="sm" asChild>
					<a
						href={whatsappUrl(WHATSAPP_TEXT)}
						target="_blank"
						rel="noreferrer noopener"
						aria-label="Agendar reunión de introducción por WhatsApp"
					>
						Agendar reunión de introducción
					</a>
				</Button>
			</div>
		</header>
	);
}
