import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wordmark } from "@/components/ui/Wordmark";

describe("Wordmark", () => {
	it("renders both Theo and Lab parts", () => {
		render(<Wordmark />);
		expect(screen.getByText("Theo")).toBeInTheDocument();
		expect(screen.getByText("Lab")).toBeInTheDocument();
	});

	it("exposes accessible label", () => {
		render(<Wordmark />);
		expect(screen.getByLabelText("TheoLab")).toBeInTheDocument();
	});

	it("applies brand gradient class to Lab span", () => {
		render(<Wordmark />);
		expect(screen.getByText("Lab")).toHaveClass("text-brand-gradient");
	});
});
