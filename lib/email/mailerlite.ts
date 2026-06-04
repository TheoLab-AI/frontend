import type { EmailService, LeadContact, TransactionalMessage } from "@/lib/email/types";

const API = "https://connect.mailerlite.com/api";

export interface MailerLiteConfig {
	apiKey: string;
	groupInicial: string;
	groupCompleta: string;
	groupFundador: string;
	groupNotify: string;
}

function readConfig(): MailerLiteConfig {
	const apiKey = process.env.MAILERLITE_API_KEY;
	const groupInicial = process.env.MAILERLITE_GROUP_INICIAL;
	const groupCompleta = process.env.MAILERLITE_GROUP_COMPLETA;
	const groupFundador = process.env.MAILERLITE_GROUP_FUNDADOR;
	const groupNotify = process.env.MAILERLITE_GROUP_NOTIFY;
	if (!apiKey || !groupInicial || !groupCompleta || !groupFundador || !groupNotify) {
		throw new Error("MailerLite: faltan variables de entorno");
	}
	return { apiKey, groupInicial, groupCompleta, groupFundador, groupNotify };
}

export function createMailerLiteService(
	fetchImpl: typeof fetch = fetch,
	config: MailerLiteConfig = readConfig(),
): EmailService {
	async function postSubscriber(body: unknown): Promise<void> {
		const res = await fetchImpl(`${API}/subscribers`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${config.apiKey}`,
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`MailerLite ${res.status}: ${text}`);
		}
	}

	return {
		async registrarLead(c: LeadContact): Promise<void> {
			const groups = [c.plan === "inicial" ? config.groupInicial : config.groupCompleta];
			if (c.edicion === "fundador") groups.push(config.groupFundador);
			// precio no se mapea como custom field en Fase 1: viaja en la notificación interna (enviarTransaccional).
			await postSubscriber({
				email: c.email,
				fields: {
					name: c.nombre,
					empresa: c.empresa,
					telefono: c.telefono,
					plan_seleccionado: c.plan,
					edicion: c.edicion,
					estado_comercial: c.estadoComercial,
					fuente_lead: c.fuenteLead,
					servicio_interes: c.servicioInteres,
					fecha_contacto: c.fechaContacto,
				},
				groups,
			});
		},
		// Fase 1 (MailerLite): la notificación interna se enruta por grupo; el discriminador `template` lo usará el adapter Resend en Fase 2.
		async enviarTransaccional(m: TransactionalMessage): Promise<void> {
			await postSubscriber({
				email: m.to,
				fields: { ...m.data },
				groups: [config.groupNotify],
			});
		},
	};
}
