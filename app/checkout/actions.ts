"use server";

import { redirect } from "next/navigation";
import { type CheckoutResult, procesarCheckout } from "@/lib/checkout";
import { getEmailService } from "@/lib/email";

export async function checkoutAction(
	_prev: CheckoutResult | null,
	formData: FormData,
): Promise<CheckoutResult> {
	const input = {
		nombre: String(formData.get("nombre") ?? ""),
		email: String(formData.get("email") ?? ""),
		empresa: String(formData.get("empresa") ?? ""),
		telefono: String(formData.get("telefono") ?? ""),
		plan: String(formData.get("plan") ?? ""),
		fuente: String(formData.get("fuente") ?? ""),
	};
	const result = await procesarCheckout(input, getEmailService());
	if (result.ok) redirect("/checkout/confirmacion");
	return result;
}
