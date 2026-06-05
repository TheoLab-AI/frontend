import type { MockedFunction } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { createMailerLiteService } from "@/lib/email/mailerlite";
import type { LeadContact } from "@/lib/email/types";

const config = {
	apiKey: "k",
	groupInicial: "g-ini",
	groupCompleta: "g-com",
	groupFundador: "g-fun",
	groupNotify: "g-not",
};

const lead: LeadContact = {
	nombre: "Ana",
	email: "ana@firma.co",
	empresa: "Firma SAS",
	telefono: "3000000000",
	plan: "inicial",
	precio: "$200.000",
	edicion: "fundador",
	estadoComercial: "prospecto",
	fuenteLead: "web",
	servicioInteres: "consultoria",
	fechaContacto: "2026-06-03",
};

function okFetch(): MockedFunction<typeof fetch> {
	return vi.fn(async () => new Response("{}", { status: 200 })) as unknown as MockedFunction<
		typeof fetch
	>;
}

describe("createMailerLiteService.registrarLead", () => {
	it("postea suscriptor con custom fields y groups intencion + fundador", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).registrarLead(lead);
		// biome-ignore lint/style/noNonNullAssertion: test index access
		const [url, init] = fetchImpl.mock.calls[0]!;
		expect(url).toBe("https://connect.mailerlite.com/api/subscribers");
		const body = JSON.parse((init as RequestInit).body as string);
		expect(body.email).toBe("ana@firma.co");
		expect(body.fields.estado_comercial).toBe("prospecto");
		expect(body.fields.plan_seleccionado).toBe("inicial");
		expect(body.groups).toEqual(["g-ini", "g-fun"]);
		expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer k" });
	});

	it("plan completa sin fundador → solo group completa", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).registrarLead({
			...lead,
			plan: "completa",
			edicion: "regular",
		});
		// biome-ignore lint/style/noNonNullAssertion: test index access
		const body = JSON.parse((fetchImpl.mock.calls[0]![1] as RequestInit).body as string);
		expect(body.groups).toEqual(["g-com"]);
	});

	it("lanza error si MailerLite responde no-2xx (no silencia)", async () => {
		const fetchImpl = vi.fn(async () => new Response("nope", { status: 422 }));
		await expect(createMailerLiteService(fetchImpl, config).registrarLead(lead)).rejects.toThrow(
			/MailerLite 422/,
		);
	});
});

describe("createMailerLiteService.enviarTransaccional", () => {
	it("registra la notificación interna en el group notify", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).enviarTransaccional({
			to: "admin@theolab.tech",
			template: "notificacion-interna",
			data: { nombre: "Ana", plan: "inicial" },
		});
		// biome-ignore lint/style/noNonNullAssertion: test index access
		const body = JSON.parse((fetchImpl.mock.calls[0]![1] as RequestInit).body as string);
		expect(body.email).toBe("admin@theolab.tech");
		expect(body.groups).toEqual(["g-not"]);
		expect(body.fields.nombre).toBe("Ana");
	});
});
