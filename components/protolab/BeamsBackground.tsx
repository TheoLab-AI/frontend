"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactElement, useEffect, useRef } from "react";

/* =========================================================================
 * BeamsBackground — fondo animado de haces de luz diagonales
 *
 * Canvas 2D que dibuja N haces con gradient lineal vertical, blur 35px,
 * rotados ~-35° (oblicuos), subiendo en loop. Cada haz tiene su propio
 * hue, opacidad pulsante (sin de su fase), y velocidad.
 *
 * Adaptado del componente original (paleta cyan/violet 190-260°) a la
 * paleta TheoLab: hues 36-60° (Golden Hour ambar/gold/honey). Saturacion
 * bajada de 85% a 70%, opacity range bajado para que el fondo no robe
 * atencion al robot 3D ni a la UI conversacional.
 *
 * prefers-reduced-motion: no anima — render estatico del primer frame.
 *
 * ========================================================================= */

interface BeamsBackgroundProps {
	className?: string;
	intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
	x: number;
	y: number;
	width: number;
	length: number;
	angle: number;
	speed: number;
	opacity: number;
	hue: number;
	pulse: number;
	pulseSpeed: number;
}

// Paleta TheoLab: hue base 36 (gold deep) hasta 60 (honey light).
// Saturation 70 (sobrio, no neon). Lightness 65.
const HUE_BASE = 36;
const HUE_SPREAD = 24;
const SAT_PERCENT = 70;
const LIGHT_PERCENT = 65;

const MINIMUM_BEAMS = 18;

const intensityOpacityMultiplier = {
	subtle: 0.85,
	medium: 1.2,
	strong: 1.6,
} as const;

function createBeam(width: number, height: number): Beam {
	const angle = -35 + Math.random() * 10;
	return {
		x: Math.random() * width * 1.5 - width * 0.25,
		y: Math.random() * height * 1.5 - height * 0.25,
		width: 30 + Math.random() * 60,
		length: height * 2.5,
		angle,
		speed: 0.5 + Math.random() * 1.0,
		opacity: 0.16 + Math.random() * 0.16,
		hue: HUE_BASE + Math.random() * HUE_SPREAD,
		pulse: Math.random() * Math.PI * 2,
		pulseSpeed: 0.02 + Math.random() * 0.025,
	};
}

export function BeamsBackground({
	className = "",
	intensity = "subtle",
}: BeamsBackgroundProps): ReactElement {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const beamsRef = useRef<Beam[]>([]);
	const rafRef = useRef<number | null>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const updateCanvasSize = (): void => {
			const dpr = window.devicePixelRatio || 1;
			const parent = canvas.parentElement;
			const w = parent?.clientWidth ?? window.innerWidth;
			const h = parent?.clientHeight ?? window.innerHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);

			const totalBeams = Math.round(MINIMUM_BEAMS * 1.4);
			beamsRef.current = Array.from({ length: totalBeams }, () =>
				createBeam(canvas.width, canvas.height),
			);
		};

		updateCanvasSize();
		window.addEventListener("resize", updateCanvasSize);

		function resetBeam(beam: Beam, index: number, totalBeams: number): Beam {
			if (!canvas) return beam;
			const column = index % 3;
			const spacing = canvas.width / 3;
			beam.y = canvas.height + 100;
			beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
			beam.width = 100 + Math.random() * 100;
			beam.speed = 0.4 + Math.random() * 0.4;
			beam.hue = HUE_BASE + (index * HUE_SPREAD) / totalBeams;
			beam.opacity = 0.22 + Math.random() * 0.1;
			return beam;
		}

		function drawBeam(c: CanvasRenderingContext2D, beam: Beam): void {
			c.save();
			c.translate(beam.x, beam.y);
			c.rotate((beam.angle * Math.PI) / 180);

			const pulsingOpacity =
				beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * intensityOpacityMultiplier[intensity];

			const gradient = c.createLinearGradient(0, 0, 0, beam.length);
			gradient.addColorStop(0, `hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, 0)`);
			gradient.addColorStop(
				0.1,
				`hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, ${pulsingOpacity * 0.5})`,
			);
			gradient.addColorStop(
				0.4,
				`hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, ${pulsingOpacity})`,
			);
			gradient.addColorStop(
				0.6,
				`hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, ${pulsingOpacity})`,
			);
			gradient.addColorStop(
				0.9,
				`hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, ${pulsingOpacity * 0.5})`,
			);
			gradient.addColorStop(1, `hsla(${beam.hue}, ${SAT_PERCENT}%, ${LIGHT_PERCENT}%, 0)`);

			c.fillStyle = gradient;
			c.fillRect(-beam.width / 2, 0, beam.width, beam.length);
			c.restore();
		}

		function drawFrame(): void {
			if (!canvas || !ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.filter = "blur(35px)";

			const totalBeams = beamsRef.current.length;
			for (let i = 0; i < totalBeams; i++) {
				const beam = beamsRef.current[i];
				if (!beam) continue;
				if (!reduce) {
					beam.y -= beam.speed;
					beam.pulse += beam.pulseSpeed;
					if (beam.y + beam.length < -100) {
						resetBeam(beam, i, totalBeams);
					}
				}
				drawBeam(ctx, beam);
			}
		}

		function animate(): void {
			drawFrame();
			if (!reduce) {
				rafRef.current = requestAnimationFrame(animate);
			}
		}

		animate();

		return () => {
			window.removeEventListener("resize", updateCanvasSize);
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [intensity, reduce]);

	return (
		<div
			aria-hidden="true"
			className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
		>
			<canvas ref={canvasRef} className="absolute inset-0" style={{ filter: "blur(12px)" }} />
			{/* Capa de "respiracion" del fondo: oscuridad pulsante encima de los
			    beams. Da sensacion editorial sin requerir GPU extra. */}
			<motion.div
				className="absolute inset-0"
				style={{
					backgroundColor: "color-mix(in oklab, var(--color-onyx) 18%, transparent)",
					backdropFilter: "blur(40px)",
				}}
				animate={
					reduce
						? undefined
						: {
								opacity: [0.35, 0.55, 0.35],
							}
				}
				transition={
					reduce
						? undefined
						: {
								duration: 9,
								ease: "easeInOut",
								repeat: Infinity,
							}
				}
			/>
		</div>
	);
}
