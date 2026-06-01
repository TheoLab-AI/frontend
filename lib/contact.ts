export const contact = {
	whatsapp: {
		number: "573182395252",
		display: "+57 318 2395252",
		owner: "Juan José",
	},
	email: "admin@theolab.tech",
} as const;

export function whatsappUrl(text?: string): string {
	const base = `https://wa.me/${contact.whatsapp.number}`;
	return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mailtoUrl(subject?: string): string {
	const base = `mailto:${contact.email}`;
	return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
