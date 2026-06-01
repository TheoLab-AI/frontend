import { OfferLadder } from "@/components/consultoria/OfferLadder";
import { HomeCTA } from "@/components/institucional/HomeCTA";
import { PropiedadCliente } from "@/components/institucional/PropiedadCliente";
import { Evidence } from "@/components/sections/Evidence";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Services } from "@/components/sections/Services";

export default function HomePage() {
	return (
		<>
			<main id="main" className="flex-1">
				<Hero />
				<Services />
				<OfferLadder />
				<PropiedadCliente />
				<Evidence />
				<Philosophy />
				<HomeCTA />
			</main>
			<Footer />
		</>
	);
}
