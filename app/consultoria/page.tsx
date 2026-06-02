import { ConsultoriaCTA } from "@/components/consultoria/ConsultoriaCTA";
import { ConsultoriaHero } from "@/components/consultoria/ConsultoriaHero";
import { OfferLadder } from "@/components/consultoria/OfferLadder";
import { OwnershipSection } from "@/components/consultoria/OwnershipSection";
import { ProblemSection } from "@/components/consultoria/ProblemSection";
import { ValueProp } from "@/components/consultoria/ValueProp";

export default function ConsultoriaPage() {
	return (
		<main id="main" className="flex-1">
			<ConsultoriaHero />
			<ProblemSection />
			<ValueProp />
			<OfferLadder />
			<OwnershipSection />
			<ConsultoriaCTA />
		</main>
	);
}
