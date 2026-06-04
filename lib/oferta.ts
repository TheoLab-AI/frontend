export interface StepOption {
	label: string;
	/** Precio público regular (todos los clientes). */
	price: string;
	/**
	 * Precio fundador para los primeros 10 clientes de la edición fundadora.
	 * Opcional: si no está definido, no se muestra split en UI ni se emite
	 * Offer adicional en JSON-LD.
	 */
	founderPrice?: string;
	/** Nota corta del tier fundador (ej. "Fundador · 10 cupos"). */
	founderNote?: string;
	detail: string;
}

export interface Step {
	name: string;
	price: string | null;
	detail?: string;
	options?: readonly StepOption[];
	note?: string;
}

/**
 * Fuente única del embudo. La consumen OfferLadder (/consultoria-legal + home) y
 * ofertaJsonLd. La edición fundadora ofrece descuento a los primeros 10
 * clientes; mientras `founderPrice` esté presente, el embudo muestra split
 * regular vs fundador y el JSON-LD emite ambos Offers. RETIRO MANUAL de la
 * edición fundadora = quitar `founderPrice`/`founderNote` de las opciones de
 * abajo: revierte todo (home + /consultoria-legal + JSON-LD) vía el helper
 * compartido, sin tocar componentes ni tests de estructura.
 */
export const STEPS: readonly Step[] = [
	{
		name: "Reunión de introducción",
		price: "Gratis",
		detail: "Remota, sin compromiso. Conocemos su caso y validamos el encaje.",
	},
	{
		name: "Consultoría",
		price: null,
		options: [
			{
				label: "Inicial",
				price: "$500.000",
				founderPrice: "$200.000",
				founderNote: "Fundador · 10 cupos",
				detail: "1 sesión de 2 h + el Diagnóstico en una semana.",
			},
			{
				label: "Completa",
				price: "$1.500.000",
				founderPrice: "$1.200.000",
				founderNote: "Fundador",
				detail: "Inicial + 4 sesiones en 3 semanas.",
			},
		],
		note: "Entrega el Diagnóstico: dónde la IA recupera horas y baja riesgo, con métricas.",
	},
	{
		name: "Implementación",
		price: "A la medida",
		detail:
			"Construcción, operación y mantenimiento (6 o 12 meses). Precio definido tras la Consultoría.",
	},
] as const;

/**
 * Frame narrativo de la edición fundadora — copy literal del prototipo HTML
 * v3 que se renderiza junto al embudo (F03 cuando PR4 lo construya).
 */
export const FOUNDER_FRAME =
	"Los primeros diez clientes acceden a precio fundador. No es promoción: es el precio de ser primeros, y de ayudarnos a calibrar el método sobre casos reales.";

export const FOUNDER_SPOTS_TOTAL = 10;

/**
 * Cupos de la edición fundadora aún disponibles. PERILLA MANUAL: se baja a mano
 * a medida que entran clientes (no hay conteo automático todavía). Es la fuente
 * única del contador "n/10" que muestra el header de /consultoria-legal.
 * Cuando se fidelicen los 10 → retirar la edición fundadora (ver STEPS arriba).
 */
export const FOUNDER_SPOTS_LEFT = 3;

export type ConsultoriaPlanId = "inicial" | "completa";

export interface ResolvedPlan {
	id: ConsultoriaPlanId;
	label: string;
	detail: string;
	precioRegular: string;
	precioFundador?: string;
	founderNote?: string;
}

const CONSULTORIA_STEP_INDEX = 1;
const PLAN_ID_BY_LABEL: Record<string, ConsultoriaPlanId> = {
	Inicial: "inicial",
	Completa: "completa",
};

/** Deriva los tiers de Consultoría desde STEPS (fuente única). */
export function getConsultoriaPlans(): ResolvedPlan[] {
	const options = STEPS[CONSULTORIA_STEP_INDEX].options ?? [];
	return options.map((o) => ({
		id: PLAN_ID_BY_LABEL[o.label],
		label: o.label,
		detail: o.detail,
		precioRegular: o.price,
		precioFundador: o.founderPrice,
		founderNote: o.founderNote,
	}));
}

export function getConsultoriaPlan(id: ConsultoriaPlanId): ResolvedPlan | undefined {
	return getConsultoriaPlans().find((p) => p.id === id);
}

/** Type guard único para el id de plan (lo reusa lib/checkout y la página). */
export function isConsultoriaPlanId(value: string | undefined): value is ConsultoriaPlanId {
	return value === "inicial" || value === "completa";
}

export interface EffectivePrice {
	precio: string;
	edicion: "fundador" | "regular";
	note?: string;
}

/** Precio fundador si quedan cupos y el plan lo ofrece; si no, regular. */
export function getEffectivePrice(plan: ResolvedPlan): EffectivePrice {
	if (FOUNDER_SPOTS_LEFT > 0 && plan.precioFundador) {
		return { precio: plan.precioFundador, edicion: "fundador", note: plan.founderNote };
	}
	return { precio: plan.precioRegular, edicion: "regular" };
}
