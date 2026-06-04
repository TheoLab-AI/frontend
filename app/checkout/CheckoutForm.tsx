"use client";

import { useActionState } from "react";
import type { ConsultoriaPlanId } from "@/lib/oferta";
import { checkoutAction } from "./actions";

interface CheckoutFormProps {
	plan: ConsultoriaPlanId;
	fuente: string;
}

const FIELDS = [
	{ name: "nombre", label: "Nombre", type: "text", autoComplete: "name" },
	{ name: "email", label: "Correo", type: "email", autoComplete: "email" },
	{ name: "empresa", label: "Empresa", type: "text", autoComplete: "organization" },
	{ name: "telefono", label: "Teléfono", type: "tel", autoComplete: "tel" },
] as const;

export function CheckoutForm({ plan, fuente }: CheckoutFormProps) {
	const [state, formAction, pending] = useActionState(checkoutAction, null);
	const errors = state && !state.ok ? (state.errors ?? {}) : {};
	const message = state && !state.ok ? state.message : undefined;

	return (
		<form action={formAction} className="flex flex-col gap-6">
			<input type="hidden" name="plan" value={plan} />
			<input type="hidden" name="fuente" value={fuente} />

			{FIELDS.map((f) => (
				<label key={f.name} className="flex flex-col gap-2">
					<span className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
						{f.label}
					</span>
					<input
						name={f.name}
						type={f.type}
						autoComplete={f.autoComplete}
						required
						className="border border-[var(--color-divider)] bg-transparent px-4 py-3 text-body"
					/>
					{errors[f.name as keyof typeof errors] ? (
						<span role="alert" className="text-meta text-[var(--color-crimson)]">
							{errors[f.name as keyof typeof errors]}
						</span>
					) : null}
				</label>
			))}

			{message ? (
				<p role="alert" className="text-body text-[var(--color-crimson)]">
					{message}
				</p>
			) : null}

			<button
				type="submit"
				disabled={pending}
				className="bg-[var(--color-onyx)] text-[var(--color-alabaster)] px-6 py-4 text-meta uppercase tracking-[0.18em] disabled:opacity-60"
			>
				{pending ? "Enviando…" : "Contratar"}
			</button>
		</form>
	);
}
