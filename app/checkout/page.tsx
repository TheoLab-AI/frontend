import { redirect } from "next/navigation";
import { isCheckoutEnabled } from "@/lib/flags";
import { getConsultoriaPlan, getEffectivePrice, isConsultoriaPlanId } from "@/lib/oferta";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage({
	searchParams,
}: {
	searchParams: Promise<{ plan?: string; fuente?: string }>;
}) {
	// Flag off → el feature está "dark" (sin env de backend configuradas): no
	// servir un flujo roto ni siquiera por URL directa.
	if (!isCheckoutEnabled()) redirect("/consultoria-legal");

	const { plan: planParam, fuente } = await searchParams;
	if (!isConsultoriaPlanId(planParam)) redirect("/consultoria-legal");

	// biome-ignore lint/style/noNonNullAssertion: planParam ya validado por isConsultoriaPlanId arriba
	const plan = getConsultoriaPlan(planParam)!;
	const { precio, edicion, note } = getEffectivePrice(plan);

	return (
		<main id="main" className="container-brand py-16 md:py-24">
			<div className="flex flex-col gap-12 max-w-xl">
				<header className="flex flex-col gap-4">
					<p className="text-meta uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
						Contratar · Consultoría {plan.label}
					</p>
					<h1 className="text-headline">{plan.label}</h1>
					<p className="text-body text-[var(--color-fg-muted)]">{plan.detail}</p>
					<p className="text-title">
						{precio}{" "}
						{note ? (
							<span className="text-meta uppercase tracking-[0.18em] text-[var(--color-gold)]">
								{note}
							</span>
						) : null}
					</p>
				</header>
				<CheckoutForm plan={plan.id} fuente={fuente ?? "web"} />
				<p className="text-meta text-[var(--color-fg-muted)]">
					Edición: {edicion}. Al enviar, recibirás las instrucciones de transferencia por correo.
				</p>
			</div>
		</main>
	);
}
