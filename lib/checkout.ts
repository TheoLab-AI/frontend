import type { EmailService } from "@/lib/email/types";
import {
	type ConsultoriaPlanId,
	getConsultoriaPlan,
	getEffectivePrice,
	isConsultoriaPlanId,
} from "@/lib/oferta";

export interface CheckoutInput {
	nombre: string;
	email: string;
	empresa: string;
	telefono: string;
	plan: string;
	fuente: string;
}

export type CheckoutErrors = Partial<
	Record<"nombre" | "email" | "empresa" | "telefono" | "plan", string>
>;

export type CheckoutResult =
	| { ok: true }
	| { ok: false; errors?: CheckoutErrors; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_MSG =
	"No pudimos registrar tu solicitud. Escríbenos por WhatsApp o a admin@theolab.tech y la cerramos contigo.";

/** Reusa el guard único de oferta.ts (un-dato-un-dueño). */
export const isValidPlan = isConsultoriaPlanId;

export function validateCheckout(input: Partial<CheckoutInput>): CheckoutErrors {
	const errors: CheckoutErrors = {};
	if (!input.nombre?.trim()) errors.nombre = "Ingrese su nombre.";
	if (!input.email?.trim()) errors.email = "Ingrese su correo.";
	else if (!EMAIL_RE.test(input.email)) errors.email = "Correo no válido.";
	if (!input.empresa?.trim()) errors.empresa = "Ingrese su empresa.";
	if (!input.telefono?.trim()) errors.telefono = "Ingrese su teléfono.";
	if (!isValidPlan(input.plan)) errors.plan = "Plan no válido.";
	return errors;
}

export async function procesarCheckout(
	input: CheckoutInput,
	email: EmailService,
): Promise<CheckoutResult> {
	const errors = validateCheckout(input);
	if (Object.keys(errors).length > 0) return { ok: false, errors };

	const plan = input.plan as ConsultoriaPlanId;
	const resolved = getConsultoriaPlan(plan);
	if (!resolved) return { ok: false, message: FALLBACK_MSG };
	const { precio, edicion } = getEffectivePrice(resolved);

	try {
		await email.registrarLead({
			nombre: input.nombre.trim(),
			email: input.email.trim(),
			empresa: input.empresa.trim(),
			telefono: input.telefono.trim(),
			plan,
			precio,
			edicion,
			estadoComercial: "prospecto",
			fuenteLead: input.fuente.trim() || "web",
			servicioInteres: "consultoria",
			fechaContacto: new Date().toISOString().slice(0, 10),
		});
		await email.enviarTransaccional({
			to: process.env.NOTIFICATION_EMAIL ?? "admin@theolab.tech",
			template: "notificacion-interna",
			data: { nombre: input.nombre.trim(), empresa: input.empresa.trim(), plan, precio, edicion },
		});
	} catch (error) {
		console.error("[checkout] procesarCheckout falló al registrar el lead:", error);
		return { ok: false, message: FALLBACK_MSG };
	}
	return { ok: true };
}
