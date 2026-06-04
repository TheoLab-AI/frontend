import { createMailerLiteService } from "@/lib/email/mailerlite";
import type { EmailService } from "@/lib/email/types";

/** Selecciona el proveedor por EMAIL_PROVIDER. Fase 2: añadir "resend". */
export function getEmailService(): EmailService {
	const provider = process.env.EMAIL_PROVIDER ?? "mailerlite";
	switch (provider) {
		case "mailerlite":
			return createMailerLiteService();
		default:
			throw new Error(`EMAIL_PROVIDER no soportado: ${provider}`);
	}
}
