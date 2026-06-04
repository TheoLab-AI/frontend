import { afterEach, describe, expect, it, vi } from "vitest";
import { getBankDetails } from "@/lib/bank";

afterEach(() => vi.unstubAllEnvs());

describe("getBankDetails", () => {
	it("lee los datos de transferencia desde env", () => {
		vi.stubEnv("BANK_BANCO", "Bancolombia");
		vi.stubEnv("BANK_TITULAR", "TheoLab SAS");
		vi.stubEnv("BANK_TIPO_CUENTA", "Ahorros");
		vi.stubEnv("BANK_NUMERO_CUENTA", "000-000000-00");
		vi.stubEnv("BANK_NIT", "900.000.000-0");
		expect(getBankDetails()).toEqual({
			banco: "Bancolombia",
			titular: "TheoLab SAS",
			tipoCuenta: "Ahorros",
			numeroCuenta: "000-000000-00",
			nit: "900.000.000-0",
		});
	});

	it("lanza si falta una variable", () => {
		vi.stubEnv("BANK_BANCO", "Bancolombia");
		expect(() => getBankDetails()).toThrow(/datos bancarios/i);
	});
});
