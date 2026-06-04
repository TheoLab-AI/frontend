export interface BankDetails {
	banco: string;
	titular: string;
	tipoCuenta: string;
	numeroCuenta: string;
	nit: string;
}

/** Datos de transferencia, server-side (nunca NEXT_PUBLIC). */
export function getBankDetails(): BankDetails {
	const banco = process.env.BANK_BANCO;
	const titular = process.env.BANK_TITULAR;
	const tipoCuenta = process.env.BANK_TIPO_CUENTA;
	const numeroCuenta = process.env.BANK_NUMERO_CUENTA;
	const nit = process.env.BANK_NIT;
	if (!banco || !titular || !tipoCuenta || !numeroCuenta || !nit) {
		throw new Error("Faltan datos bancarios en variables de entorno");
	}
	return { banco, titular, tipoCuenta, numeroCuenta, nit };
}
