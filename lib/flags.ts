/**
 * Feature flags del front.
 *
 * `isCheckoutEnabled` controla el embudo self-service `/checkout` (Fase 1). Es
 * `NEXT_PUBLIC_` para ser legible tanto en cliente (botón "Contratar" en
 * `OfferLadderV3`) como en servidor (guarda de las rutas `/checkout` y
 * `/checkout/confirmacion`). Off por defecto: el feature queda "dark" en
 * producción hasta configurar las env de MailerLite + datos bancarios y poner
 * `NEXT_PUBLIC_CHECKOUT_ENABLED=1`. Así main puede auto-desplegar a prod sin
 * exponer un flujo que aún no tiene backend configurado.
 */
export function isCheckoutEnabled(): boolean {
	return process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "1";
}
