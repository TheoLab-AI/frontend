export interface StepOption {
	label: string;
	price: string;
	detail: string;
}

export interface Step {
	name: string;
	price: string | null;
	detail?: string;
	options?: readonly StepOption[];
	note?: string;
}

/** Fuente única del embudo. La consumen OfferLadder (/consultoria + home) y ofertaJsonLd. */
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
				detail: "1 sesión de 2 h + el Diagnóstico en una semana.",
			},
			{ label: "Completa", price: "$1.500.000", detail: "Inicial + 4 sesiones en 3 semanas." },
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
