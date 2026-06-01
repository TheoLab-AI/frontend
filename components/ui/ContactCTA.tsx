import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

interface ContactCTAProps {
	whatsappText?: string;
	emailSubject?: string;
	className?: string;
}

export function ContactCTA({ whatsappText, emailSubject, className }: ContactCTAProps) {
	return (
		<div className={cn("flex flex-wrap gap-3", className)}>
			<Button size="lg" variant="accent" asChild>
				<a
					href={whatsappUrl(whatsappText)}
					target="_blank"
					rel="noreferrer noopener"
					aria-label="Escribir por WhatsApp"
				>
					<MessageCircle aria-hidden="true" />
					Agendar reunión de introducción
				</a>
			</Button>
			<Button size="lg" variant="outline" asChild>
				<a href={mailtoUrl(emailSubject)} aria-label="Escribir por correo">
					<Mail aria-hidden="true" />
					Escribir por correo
				</a>
			</Button>
		</div>
	);
}
