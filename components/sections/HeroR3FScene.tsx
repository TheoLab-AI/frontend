"use client";

import { Environment } from "@react-three/drei";
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

	// Duración 3.0 s — más perceptible. Cubic ease-out (slow finish) da
	// sensación de "frenado cinematográfico" al llegar al encuadre final.
	const DURATION = 3.0;
	// Z_START 2.5: medium close-up (cabeza + torso + parte de brazos).
	// Z_END 4.5: cuerpo casi entero con aire arriba (cabeza no toca borde).
	// La cámara mira a (0, 0.5, 0) → centro del frame visual.
	const Z_START = 2.5;
	const Z_END = 4.5;

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
		// Ease-out cubic: 1 - (1-t)^3 — empieza rápido, frena suave al final.
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
				toneMappingExposure: 0.85,
				outputColorSpace: THREE.SRGBColorSpace,
				powerPreference: "high-performance",
				alpha: true,
			}}
			camera={{ position: [0, 0.5, 4.5], fov: 30 }}
			shadows
			style={{ background: "transparent" }}
		>
			{/* 3-point lighting reducido para evitar reflejo excesivo del traje:
			    el material PBR del traje cyborg tiene metalness alta + roughness
			    baja, lo que genera highlights muy brillantes al recibir luz
			    direccional fuerte. Bajamos intensities y movemos la key light
			    más lateral (hacia 3/4 trasero) para que el rebote no incida
			    frontalmente sobre el saco.

			    Key: cálida desde upper-right pero MÁS DETRÁS (Z=2 vs 3.5).
			    Intensity 1.1 vs 1.65 anterior — suficiente para esculpir
			    sin quemar.
			    Fill: fría desde izquierda (sin cambio). Define el contorno.
			    Rim: cálido trasero más sutil (0.7 vs 1.1) — halo dorado
			    sin saturación. */}
			{/* Iluminación más mate — el traje PBR cyborg tiene material muy
			    reflejante, las luces direccionales fuertes lo convierten en
			    espejo. Bajamos intensities y subimos ambient para compensar.
			    Cámbiamos a colores más neutros (menos cálidos) para reducir
			    el rebote dorado del especular. */}
			<ambientLight intensity={0.55} />
			<directionalLight
				position={[3.5, 5.5, 2]}
				intensity={0.7}
				color="#f0f0f0"
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-bias={-0.0001}
			/>
			<directionalLight position={[-3.5, 1.2, 2.5]} intensity={0.35} color="#b8c8e0" />
			<directionalLight position={[0, -0.2, -5]} intensity={0.4} color="#e0c898" />

			<Suspense fallback={null}>
				{/* CameraIntro DENTRO del Suspense para que la animación de entrada
				    comience SOLO cuando el GLB ya cargó. Si estuviera fuera del
				    Suspense, los 3 s de dolly-out arrancarían en cuanto el Canvas
				    monta (antes del fetch del GLB de 15 MB) — para cuando el robot
				    se ve, la animación ya habría terminado. */}
				<CameraIntro />

				<Environment preset="studio" background={false} />
				{/* Encuadre cuerpo casi entero con aire arriba — referencia del demo
				    21st.dev: scale 1.7 + position Y=-0.7 → robot va Y=-0.7 a Y=1.0
				    (1.7 u alto). Cámara a Z=4.5 fov 30 da frustum vertical -0.71 a
				    1.71 (a Z=0). Robot visible: Y=-0.7 a Y=1.0 → cabeza con 0.71 u
				    de aire arriba (no toca borde superior), pies en el borde inferior
				    o levemente cortados. Cuerpo bien proporcionado en el frame
				    derecho del hero. */}
				<group scale={1.7} position={[0, -0.7, 0]}>
					<RobotLookAt mouseRef={mouseRef} enabled={lookAtEnabled} />
				</group>
				{/* ContactShadows desactivadas en medium-shot: los pies están fuera
				    del frame, una sombra al ras del piso (que tampoco se ve) no
				    aporta y puede generar artefactos en el borde inferior. */}
			</Suspense>

			<EffectComposer multisampling={8}>
				<SMAA />
				<Bloom intensity={0.4} luminanceThreshold={0.72} luminanceSmoothing={0.22} mipmapBlur />
			</EffectComposer>
		</Canvas>
	);
}
