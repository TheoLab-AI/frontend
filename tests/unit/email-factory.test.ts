import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailService } from "@/lib/email";

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getEmailService", () => {
	it("devuelve el adapter MailerLite cuando EMAIL_PROVIDER=mailerlite", () => {
		vi.stubEnv("EMAIL_PROVIDER", "mailerlite");
		vi.stubEnv("MAILERLITE_API_KEY", "k");
		vi.stubEnv("MAILERLITE_GROUP_INICIAL", "a");
		vi.stubEnv("MAILERLITE_GROUP_COMPLETA", "b");
		vi.stubEnv("MAILERLITE_GROUP_FUNDADOR", "c");
		vi.stubEnv("MAILERLITE_GROUP_NOTIFY", "d");
		const svc = getEmailService();
		expect(typeof svc.registrarLead).toBe("function");
	});

	it("lanza error para un proveedor no soportado", () => {
		vi.stubEnv("EMAIL_PROVIDER", "carrierpigeon");
		expect(() => getEmailService()).toThrow(/no soportado/);
	});
});
