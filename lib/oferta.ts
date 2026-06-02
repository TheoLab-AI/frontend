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
 * Fuente única del embudo. La consumen OfferLadder (/consultoria + home) y
 * ofertaJsonLd. La edición fundadora ofrece descuento a los primeros 10
 * clientes; mientras `founderPrice` esté presente, el embudo muestra split
 * regular vs fundador y el JSON-LD emite ambos Offers.
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
