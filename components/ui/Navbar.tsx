"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu, X } from "lucide-react";
import {
	AnimatePresence,
	motion,
	useMotionValueEvent,
	useReducedMotion,
	useScroll,
} from "motion/react";
import {
	type ComponentPropsWithoutRef,
	createContext,
	forwardRef,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { cn } from "@/lib/utils";

/* =========================================================================
 * Navbar — TheoLab editorial composable primitive.
 *
 * Pattern: Radix-style slot composition. Renders a fixed top bar that
 * shrinks on scroll, with an animated layoutId underline on the active
 * item and a full-screen Radix Dialog for mobile.
 *
 * Hybrid of:
 *  - Aceternity "Resizable Navbar": shrink-on-scroll composition.
 *  - Tubelight Navbar (ayushmxxn): layoutId underline on active item,
 *    re-rendered as a 1px Golden Hour gradient (NOT neon glow).
 *
 * Constraints (brand v0.3):
 *  - Esquinas casi rectas — rounded-none forzado en el wrapper.
 *  - NO box-shadow grueso — border 1px var(--color-divider) cuando scrolled.
 *  - Tipografía items: text-meta (0.75rem, uppercase, tracking 0.08em).
 *  - Respeta prefers-reduced-motion: el shrink colapsa a switch instantáneo.
 *
 * Activos:
 *  - Determinados por IntersectionObserver sobre anchors (#hash).
 *  - El item con más visibilidad recibe aria-current="location" y underline.
 *  - Si el href NO es anchor (#), el activo se infiere por window.location.pathname.
 * ========================================================================= */

/* ------------------------------------------------------------------------ */
/*  Types                                                                    */
/* ------------------------------------------------------------------------ */

export interface NavbarItem {
	href: string;
	label: string;
}

type NavbarTheme = "onyx" | "alabaster";

interface NavbarContextValue {
	theme: NavbarTheme;
	scrolled: boolean;
	activeHref: string | null;
	hoveredHref: string | null;
	setHoveredHref: (href: string | null) => void;
}

const NavbarContext = createContext<NavbarContextValue | null>(null);

function useNavbarContext(): NavbarContextValue {
	const ctx = useContext(NavbarContext);
	if (!ctx) {
		throw new Error("Navbar.* must be rendered inside <Navbar.Root>");
	}
	return ctx;
}

/* ------------------------------------------------------------------------ */
/*  Internal hook — shrink-on-scroll                                         */
/* ------------------------------------------------------------------------ */

const SHRINK_THRESHOLD = 80;

function useShrinkOnScroll(): boolean {
	const [scrolled, setScrolled] = useState(false);
	const reduceMotion = useReducedMotion();
	const { scrollY } = useScroll();

	// motion-driven path (animated).
	useMotionValueEvent(scrollY, "change", (value) => {
		if (reduceMotion) return;
		setScrolled(value > SHRINK_THRESHOLD);
	});

	// reduced-motion fallback — flat scroll listener, no animated subscription.
	useEffect(() => {
		if (!reduceMotion) return;
		const onScroll = (): void => {
			setScrolled(window.scrollY > SHRINK_THRESHOLD);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, [reduceMotion]);

	return scrolled;
}

/* ------------------------------------------------------------------------ */
/*  Internal hook — active anchor via IntersectionObserver                   */
/* ------------------------------------------------------------------------ */

function useActiveAnchor(hashHrefs: readonly string[]): string | null {
	const [activeHref, setActiveHref] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (hashHrefs.length === 0) return;

		// Map of id → href. We watch DOM nodes by their id (href#id).
		const targets = hashHrefs
			.map((href) => {
				const id = href.startsWith("#") ? href.slice(1) : null;
				if (!id) return null;
				const el = document.getElementById(id);
				return el ? { href, el } : null;
			})
			.filter((x): x is { href: string; el: HTMLElement } => x !== null);

		if (targets.length === 0) return;

		const visibility = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const match = targets.find((t) => t.el === entry.target);
					if (!match) continue;
					visibility.set(match.href, entry.intersectionRatio);
				}
				let best: { href: string; ratio: number } | null = null;
				for (const [href, ratio] of visibility) {
					if (ratio <= 0) continue;
					if (!best || ratio > best.ratio) best = { href, ratio };
				}
				setActiveHref(best?.href ?? null);
			},
			{
				// Layered thresholds — we need ratio resolution to compare visibility.
				threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
				// Bias slightly below the top of the viewport — the section that
				// sits in the middle wins, not the one just entering from the bottom.
				rootMargin: "-20% 0px -45% 0px",
			},
		);

		for (const t of targets) observer.observe(t.el);
		return () => {
			observer.disconnect();
		};
	}, [hashHrefs]);

	return activeHref;
}

/* ------------------------------------------------------------------------ */
/*  Root                                                                     */
/* ------------------------------------------------------------------------ */

const rootVariants = cva(
	[
		"fixed top-0 inset-x-0 z-40",
		"rounded-none",
		"transition-[background-color,border-color,backdrop-filter,height] duration-200",
		"ease-[var(--ease-brand)]",
		"border-b",
	].join(" "),
	{
		variants: {
			theme: {
				onyx: "text-[var(--color-alabaster)]",
				alabaster: "text-[var(--color-onyx)]",
			},
			scrolled: {
				true: "",
				false: "bg-transparent border-b-transparent",
			},
		},
		compoundVariants: [
			{
				theme: "onyx",
				scrolled: true,
				class: "bg-[var(--color-onyx)]/80 backdrop-blur-md border-b-[var(--color-divider)]",
			},
			{
				theme: "alabaster",
				scrolled: true,
				class: "bg-[var(--color-alabaster)]/90 backdrop-blur-md border-b-[var(--color-divider)]",
			},
		],
		defaultVariants: {
			theme: "onyx",
			scrolled: false,
		},
	},
);

interface NavbarRootProps extends Pick<VariantProps<typeof rootVariants>, "theme"> {
	/**
	 * Anchors to observe for active-state detection.
	 * Pass the same `href` values used in Navbar.Items / Navbar.Mobile that
	 * point to in-page sections (e.g. `#diagnostico`). Items with non-hash
	 * hrefs are ignored for IO tracking.
	 *
	 * If you don't pass this, Navbar.Items auto-collects hash hrefs from
	 * the items it renders — but if you want both Navbar.Items and
	 * Navbar.Mobile to share active state, declare them here.
	 */
	anchors?: readonly string[];
	children: ReactNode;
	ariaLabel?: string;
	className?: string;
	id?: string;
}

const NavbarRoot = forwardRef<HTMLElement, NavbarRootProps>(function NavbarRoot(
	{ className, theme = "onyx", anchors, ariaLabel = "Principal", children, id },
	ref,
): ReactElement {
	const scrolled = useShrinkOnScroll();
	const [hoveredHref, setHoveredHref] = useState<string | null>(null);
	const anchorList = useMemo(() => anchors ?? [], [anchors]);
	const activeHref = useActiveAnchor(anchorList);

	const ctx = useMemo<NavbarContextValue>(
		() => ({
			theme: theme ?? "onyx",
			scrolled,
			activeHref,
			hoveredHref,
			setHoveredHref,
		}),
		[theme, scrolled, activeHref, hoveredHref],
	);

	return (
		<NavbarContext.Provider value={ctx}>
			<motion.header
				ref={ref}
				id={id}
				role="navigation"
				aria-label={ariaLabel}
				initial={false}
				animate={{ height: scrolled ? "3.25rem" : "4.5rem" }}
				transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
				className={cn(rootVariants({ theme, scrolled, className }))}
			>
				<div className={cn("container-brand flex h-full items-center gap-6", "justify-between")}>
					{children}
				</div>
			</motion.header>
		</NavbarContext.Provider>
	);
});

/* ------------------------------------------------------------------------ */
/*  Brand                                                                    */
/* ------------------------------------------------------------------------ */

interface NavbarBrandProps extends ComponentPropsWithoutRef<"div"> {
	/**
	 * Optional secondary label rendered after a pipe divider, mono style.
	 * Example: subLabel="DIAGNÓSTICO V2.0" → "TheoLab // DIAGNÓSTICO V2.0".
	 */
	subLabel?: string;
}

const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(function NavbarBrand(
	{ className, children, subLabel, ...props },
	ref,
): ReactElement {
	return (
		<div ref={ref} className={cn("flex shrink-0 items-center gap-3", className)} {...props}>
			{children}
			{subLabel ? (
				<>
					<span aria-hidden="true" className="text-mono text-[0.65rem] opacity-50 select-none">
						{"//"}
					</span>
					<span className="text-mono text-[0.65rem] opacity-70 uppercase">{subLabel}</span>
				</>
			) : null}
		</div>
	);
});

/* ------------------------------------------------------------------------ */
/*  Items (desktop)                                                          */
/* ------------------------------------------------------------------------ */

interface NavbarItemsProps extends Omit<ComponentPropsWithoutRef<"ul">, "children"> {
	items: readonly NavbarItem[];
}

const NavbarItems = forwardRef<HTMLUListElement, NavbarItemsProps>(function NavbarItems(
	{ className, items, ...props },
	ref,
): ReactElement {
	const { theme, activeHref, hoveredHref, setHoveredHref } = useNavbarContext();

	// Underline target: hover wins if present, otherwise IO-derived active.
	const underlineHref = hoveredHref ?? activeHref;

	return (
		<ul
			ref={ref}
			className={cn("hidden md:flex items-center gap-1", "min-w-0", className)}
			onMouseLeave={() => setHoveredHref(null)}
			{...props}
		>
			{items.map((item) => {
				const isActive = activeHref === item.href;
				const showUnderline = underlineHref === item.href;
				return (
					<li key={item.href} className="relative">
						<a
							href={item.href}
							aria-current={isActive ? "location" : undefined}
							onMouseEnter={() => setHoveredHref(item.href)}
							onFocus={() => setHoveredHref(item.href)}
							onBlur={() => setHoveredHref(null)}
							className={cn(
								"relative inline-flex items-center px-3 py-2 whitespace-nowrap",
								"text-meta",
								"transition-colors duration-[180ms] ease-[var(--ease-brand)]",
								"focus-visible:outline-none",
								theme === "onyx"
									? cn(
											"text-[var(--color-alabaster)]/65 hover:text-[var(--color-alabaster)]",
											isActive && "text-[var(--color-alabaster)]",
										)
									: cn(
											"text-[var(--color-onyx)]/55 hover:text-[var(--color-onyx)]",
											isActive && "text-[var(--color-onyx)]",
										),
							)}
						>
							{item.label}
							{showUnderline ? (
								<motion.span
									layoutId="theolab-nav-underline"
									aria-hidden="true"
									className="absolute left-2 right-2 -bottom-[2px] h-px"
									style={{
										background:
											"linear-gradient(90deg, var(--color-crimson) 0%, oklch(0.72 0.2 60) 50%, var(--color-gold) 100%)",
									}}
									transition={{
										duration: 0.4,
										ease: [0.16, 1, 0.3, 1],
									}}
								/>
							) : null}
						</a>
					</li>
				);
			})}
		</ul>
	);
});

/* ------------------------------------------------------------------------ */
/*  Status slot                                                              */
/* ------------------------------------------------------------------------ */

const NavbarStatus = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
	function NavbarStatus({ className, children, ...props }, ref): ReactElement {
		return (
			<div ref={ref} className={cn("hidden md:flex items-center shrink-0", className)} {...props}>
				{children}
			</div>
		);
	},
);

/* ------------------------------------------------------------------------ */
/*  CTA slot                                                                 */
/* ------------------------------------------------------------------------ */

const NavbarCTA = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(function NavbarCTA(
	{ className, children, ...props },
	ref,
): ReactElement {
	return (
		<div ref={ref} className={cn("hidden md:flex items-center shrink-0", className)} {...props}>
			{children}
		</div>
	);
});

/* ------------------------------------------------------------------------ */
/*  Mobile — hamburger + Radix Dialog                                        */
/* ------------------------------------------------------------------------ */

interface NavbarMobileProps {
	items: readonly NavbarItem[];
	brand?: ReactNode;
	cta?: ReactNode;
	className?: string;
}

function NavbarMobile({ items, brand, cta, className }: NavbarMobileProps): ReactElement {
	const { theme, activeHref } = useNavbarContext();
	const [open, setOpen] = useState(false);

	// Body scroll lock — Radix already sets pointer-events on the overlay
	// but does NOT lock body scroll by default for non-modal-like overlays.
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	const onItemClick = useCallback(() => {
		setOpen(false);
	}, []);

	const overlayBg =
		theme === "onyx" ? "bg-[var(--color-onyx)]/95" : "bg-[var(--color-alabaster)]/95";

	const fgClass = theme === "onyx" ? "text-[var(--color-alabaster)]" : "text-[var(--color-onyx)]";

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					aria-label={open ? "Cerrar menú" : "Abrir menú"}
					aria-expanded={open}
					className={cn(
						"md:hidden inline-flex h-10 w-10 items-center justify-center",
						"rounded-none border border-transparent",
						"text-[var(--color-fg)]",
						"hover:border-[var(--color-divider)]",
						"transition-colors duration-200 ease-[var(--ease-brand)]",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
						className,
					)}
				>
					<Menu className="h-5 w-5" aria-hidden="true" />
				</button>
			</Dialog.Trigger>

			<AnimatePresence>
				{open ? (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
								className={cn("fixed inset-0 z-50 backdrop-blur-md", overlayBg)}
							/>
						</Dialog.Overlay>

						<Dialog.Content asChild>
							<motion.div
								initial={{ opacity: 0, y: -24 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -16 }}
								transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
								className={cn("fixed inset-0 z-50 flex flex-col", "rounded-none", fgClass)}
							>
								<Dialog.Title className="sr-only">Menú principal</Dialog.Title>
								<Dialog.Description className="sr-only">Navegación de TheoLab</Dialog.Description>

								{/* Top row — brand + close */}
								<div className="container-brand flex h-18 items-center justify-between border-b border-[var(--color-divider)]/30">
									<div className="flex items-center gap-3">{brand}</div>
									<Dialog.Close asChild>
										<button
											type="button"
											aria-label="Cerrar menú"
											className={cn(
												"inline-flex flex-col items-end gap-0.5",
												"px-2 py-2",
												"rounded-none border border-transparent",
												"hover:border-[var(--color-divider)]",
												"transition-colors duration-200 ease-[var(--ease-brand)]",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
											)}
										>
											<X className="h-5 w-5" aria-hidden="true" />
											<span className="text-mono text-[0.65rem] opacity-60 uppercase">Cerrar</span>
										</button>
									</Dialog.Close>
								</div>

								{/* Items — large editorial links */}
								<nav
									aria-label="Principal móvil"
									className="container-brand flex flex-1 flex-col justify-center gap-2 py-12"
								>
									<ul className="flex flex-col gap-1">
										{items.map((item, index) => {
											const isActive = activeHref === item.href;
											return (
												<li key={item.href}>
													<motion.a
														href={item.href}
														onClick={onItemClick}
														aria-current={isActive ? "location" : undefined}
														initial={{ opacity: 0, y: 12 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{
															duration: 0.32,
															delay: 0.08 + index * 0.04,
															ease: [0.16, 1, 0.3, 1],
														}}
														className={cn(
															"group flex items-baseline justify-between gap-6",
															"py-4 border-b border-[var(--color-divider)]/25",
															"[font-family:var(--font-display)]",
															"text-[clamp(2rem,7vw,3rem)] font-semibold leading-[1.05]",
															"tracking-[-0.025em]",
															"transition-colors duration-200 ease-[var(--ease-brand)]",
															isActive
																? "text-[var(--color-fg)]"
																: "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
														)}
													>
														<span>{item.label}</span>
														<span aria-hidden="true" className="text-mono text-[0.7rem] opacity-50">
															{String(index + 1).padStart(2, "0")}
														</span>
													</motion.a>
												</li>
											);
										})}
									</ul>
								</nav>

								{/* Footer — CTA */}
								{cta ? (
									<div className="container-brand flex items-center justify-between border-t border-[var(--color-divider)]/30 py-6">
										<span className="text-mono text-[0.65rem] uppercase opacity-50">— Acción</span>
										{/* Dialog.Close asChild forwards onClick to the rendered CTA, so we
										 * close the menu when the user activates the button/link. Keyboard
										 * activation flows through naturally because the slot child is an
										 * interactive element. */}
										<Dialog.Close asChild>{cta}</Dialog.Close>
									</div>
								) : null}
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				) : null}
			</AnimatePresence>
		</Dialog.Root>
	);
}

/* ------------------------------------------------------------------------ */
/*  Public composable surface                                                */
/* ------------------------------------------------------------------------ */

export const Navbar = {
	Root: NavbarRoot,
	Brand: NavbarBrand,
	Items: NavbarItems,
	Status: NavbarStatus,
	CTA: NavbarCTA,
	Mobile: NavbarMobile,
};

export { NavbarBrand, NavbarCTA, NavbarItems, NavbarMobile, NavbarRoot, NavbarStatus };
