import { getBankDetails } from "@/lib/bank";

export default function ConfirmacionPage() {
	const bank = getBankDetails();
	const filas: [string, string][] = [
		["Banco", bank.banco],
		["Titular", bank.titular],
		["Tipo de cuenta", bank.tipoCuenta],
		["Número de cuenta", bank.numeroCuenta],
		["NIT", bank.nit],
	];

	return (
		<main id="main" className="container-brand py-16 md:py-24">
			<div className="flex flex-col gap-8 max-w-xl">
				<h1 className="text-headline">Recibimos tu solicitud</h1>
				<p className="text-body text-[var(--color-fg-muted)]">
					Te enviamos las instrucciones por correo. Realiza la transferencia a los siguientes datos
					y responde el correo con el comprobante; confirmamos manualmente.
				</p>
				<dl className="flex flex-col divide-y divide-[var(--color-divider)] border-y border-[var(--color-divider)]">
					{filas.map(([k, v]) => (
						<div key={k} className="flex justify-between gap-6 py-4">
							<dt className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
								{k}
							</dt>
							<dd className="text-body">{v}</dd>
						</div>
					))}
				</dl>
				<a href="/" className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
					Volver al inicio →
				</a>
			</div>
		</main>
	);
}
