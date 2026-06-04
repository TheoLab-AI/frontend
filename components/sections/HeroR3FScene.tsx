"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { type MutableRefObject, type ReactElement, Suspense, useRef } from "react";
import * as THREE from "three";
import { type MouseFollowRef, RobotLookAt } from "@/components/r3f/RobotLookAt";

/* -------------------------------------------------------------------------
 * CameraIntro — dolly-out de entrada
 *
 * Al montar, mueve la cámara desde un close-up (Z=2.5, robot enfocado al
 * pecho/cara) hasta la posición final cuerpo-entero (Z=5.0) durante 2.5 s
 * con easing ease-out cubic. Una sola vez — después de completar se
 * mantiene en la posición final sin overhead.
 *
 * Y se mantiene en 0.5 (centro vertical del frame visible) durante toda
 * la transición. X siempre 0 (frontal).
 *
 * Cubic ease-out: empieza rápido, frena suave al llegar — sensación de
 * "presentación cinematográfica" del personaje, no de zoom mecánico.
 * ------------------------------------------------------------------------- */
function CameraIntro(): null {
	const { camera } = useThree();
	const startTimeRef = useRef<number | null>(null);
	const completedRef = useRef<boolean>(false);

	const DURATION = 2.5;
	const Z_START = 2.5;
	const Z_END = 5.0;

	useFrame((state) => {
		if (completedRef.current) return;
		if (startTimeRef.current === null) {
			startTimeRef.current = state.clock.elapsedTime;
			// Set inicial sólo en el primer frame para evitar pop visual.
			camera.position.set(0, 0.5, Z_START);
			camera.updateProjectionMatrix();
			return;
		}

		const elapsed = state.clock.elapsedTime - startTimeRef.current;
		const t = Math.min(1, elapsed / DURATION);
		// Ease-out cubic: 1 - (1-t)^3
		const eased = 1 - (1 - t) ** 3;
		const z = Z_START + (Z_END - Z_START) * eased;

		camera.position.set(0, 0.5, z);
		camera.updateProjectionMatrix();

		if (t >= 1) completedRef.current = true;
	});

	return null;
}

/* =========================================================================
 * HeroR3FScene — Canvas R3F para el Hero de producción
 *
 * Setup HD calibrado para FONDO ONYX OSCURO (Card variant="dark" detrás).
 *
 * --- Framing ---
 * El bbox del GLB rigged es:
 *   X: -0.95 .. 0.95  (ancho ~1.9 u)
 *   Y: -0.5  .. 1.5   (altura 2.0 u, origen en los pies)
 *   Z: -0.21 .. 0.21
 *
 * Cámara a [0, 0.5, 5.0] mirando hacia -Z desde Y=0.5 (centro vertical del
 * robot). A fov 30°, el frustum vertical a Z=0 mide 2 × 5 × tan(15°) ≈
 * 2.68 u — margen vertical de ~0.34 u arriba y abajo. En aspect ratio
 * portrait (container 819×1080 aprox) el ancho visible es ~2.04 u, lo
 * cual cubre los hombros (1.9 u) con margen. Cuerpo entero visible sin
 * recorte en cualquier viewport razonable.
 *
 * Cambio vs versión anterior ([0, 1.05, 1.85] fov 32 — busto-arriba): esa
 * cámara estaba calibrada al POC alabaster con container cuadrado. En
 * producción el container es portrait y dejaba el robot mostrando solo
 * de cintura para abajo.
 *
 * --- Anti-aliasing ---
 * - dpr=[1.5, 2.5] (vs [1, 2]): renderiza a 1.5× mínimo y hasta 2.5× en
 *   retina. Mejora los edges del modelo PBR sin pasar a 3× que quema
 *   batería en Apple devices.
 * - multisampling=8 en EffectComposer (vs 4): MSAA hardware más agresivo
 *   sobre los polygons, complementado con SMAA postprocess.
 *
 * --- Calibración heredada ---
 *   - toneMappingExposure 1.15 — fondo oscuro absorbe luz
 *   - Environment preset "studio" — gradiente neutro cinematic
 *   - Bloom intensity 0.4 / luminanceThreshold 0.72 — highlights del cyborg
 *   - ContactShadows opacity 0.55 color #000 — definida sobre onyx
 *   - 3-point lighting: key cálido upper-right (no compite con Spotlight
 *     gold upper-left), fill frío izq-inferior, rim cálido back-low
 *   - OrbitControls REMOVIDOS — producción no permite rotación libre
 *
 * Canvas transparente: hereda el bg del Card padre (var(--color-onyx)).
 * ========================================================================= */

interface HeroR3FSceneProps {
	mouseRef: MutableRefObject<MouseFollowRef>;
	lookAtEnabled?: boolean;
}

export function HeroR3FScene({ mouseRef, lookAtEnabled = true }: HeroR3FSceneProps): ReactElement {
	return (
		<Canvas
			dpr={[1.5, 2.5]}
			gl={{
				antialias: true,
				toneMapping: THREE.ACESFilmicToneMapping,
				toneMappingExposure: 1.15,
				outputColorSpace: THREE.SRGBColorSpace,
				powerPreference: "high-performance",
				alpha: true,
			}}
			camera={{ position: [0, 0.5, 5.0], fov: 30 }}
			shadows
			style={{ background: "transparent" }}
		>
			{/* 3-point lighting calibrado para fondo onyx + composición editorial.
			    Key cálido upper-right contrasta con el Spotlight gold (upper-left
			    de la Card) — evita que las luces compitan por el mismo lado.
			    Fill frío inferior-izq define contorno; rim cálido trasero da
			    halo dorado coherente con var(--color-gold). */}
			<ambientLight intensity={0.35} />
			<directionalLight
				position={[4, 5.5, 3.5]}
				intensity={1.65}
				color="#fff4dc"
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-bias={-0.0001}
			/>
			<directionalLight position={[-3.5, 1.2, 2.5]} intensity={0.5} color="#a0c4ff" />
			<directionalLight position={[0, -0.2, -5]} intensity={1.1} color="#f6c060" />

			{/* Cámara dolly-out de entrada: close-up (Z=2.5) → cuerpo entero (Z=5.0) */}
			<CameraIntro />

			<Suspense fallback={null}>
				<Environment preset="studio" background={false} />
				{/* Group scale 1.4 (bajado de 1.8 anterior que sacaba los pies fuera
				    del frustum vertical) lleva al robot Mixamo a ~1.4 u de altura.
				    position Y=-0.2 centra el robot verticalmente con la cámara que
				    mira a (0, 0.5, 0) — robot va Y=-0.2 a Y=1.2, cabe con margen en
				    frustum vertical (Y=-0.84 a Y=1.84 a Z=0 con fov 30 desde Z=5).
				    Sin rotación extra: el rig Mixamo viene mirando +Z natural. */}
				<group scale={1.4} position={[0, -0.2, 0]}>
					<RobotLookAt mouseRef={mouseRef} enabled={lookAtEnabled} />
				</group>
				<ContactShadows
					position={[0, -0.2, 0]}
					opacity={0.55}
					scale={6}
					blur={2.6}
					far={1.5}
					color="#000000"
				/>
			</Suspense>

			<EffectComposer multisampling={8}>
				<SMAA />
				<Bloom intensity={0.4} luminanceThreshold={0.72} luminanceSmoothing={0.22} mipmapBlur />
			</EffectComposer>
		</Canvas>
	);
}
