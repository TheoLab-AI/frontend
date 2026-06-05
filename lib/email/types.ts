export type EstadoComercial = "lead" | "prospecto" | "cliente" | "cliente-recurrente" | "inactivo";

/** Lead capturado por el checkout + campos del journey (Fases 2-4 de la estrategia). */
export interface LeadContact {
	nombre: string;
	email: string;
	empresa: string;
	telefono: string;
	plan: "inicial" | "completa";
	precio: string;
	edicion: "fundador" | "regular";
	estadoComercial: Extract<EstadoComercial, "prospecto">;
	fuenteLead: string;
	servicioInteres: "consultoria";
	fechaContacto: string; // YYYY-MM-DD
}

export interface TransactionalMessage {
	to: string;
	template: "notificacion-interna";
	data: Record<string, string>;
}

/** Puerto: el checkout depende de esto, nunca de MailerLite directamente. */
export interface EmailService {
	registrarLead(contact: LeadContact): Promise<void>;
	enviarTransaccional(message: TransactionalMessage): Promise<void>;
}
