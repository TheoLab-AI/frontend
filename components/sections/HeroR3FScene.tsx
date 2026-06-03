"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { type MutableRefObject, type ReactElement, Suspense } from "react";
import * as THREE from "three";
import { type MouseFollowRef, RobotLookAt } from "@/components/r3f/RobotLookAt";

/* =========================================================================
 * HeroR3FScene — Canvas R3F para el Hero de producción
 *
 * Setup HD calibrado para FONDO ONYX OSCURO (Card variant="dark" detrás).
 * Diferencias vs HeroR3FPoc (fondo alabaster):
 *   - toneMappingExposure 1.15 (vs 1.0) — fondo oscuro absorbe luz, necesita más
 *   - Environment preset "studio" (vs "city") — gradiente neutro más cinematic
 *   - Bloom intensity 0.4 luminanceThreshold 0.72 (vs 0.25 / 0.9) —
 *     los highlights del traje cyborg se vuelven dramáticos sobre onyx
 *   - ContactShadows opacity 0.55, color #000 — sombra más definida sobre
 *     el background del Card (el Canvas es transparente, así que la sombra
 *     se proyecta sobre lo que esté detrás)
 *   - 3-point lighting recalibrado: key cálido desde upper-right (no izq.) para
 *     contrastar con el Spotlight gold que vive en upper-left de la Card
 *   - Fill frío desde lower-left para definir contorno contra onyx
 *   - Rim cálido desde back-low para halo dorado coherente con la paleta brand
 *   - OrbitControls REMOVIDOS — producción no permite rotación libre
 *   - dpr=[1, 2] retina sin pasar a 3x (Apple devices) para no quemar batería
 *
 * Canvas transparente: hereda el bg del Card padre (var(--color-onyx)).
 * Suspense fallback es null porque el contenedor padre ya muestra el placeholder
 * mientras el chunk dynamic carga.
 * ========================================================================= */

interface HeroR3FSceneProps {
	mouseRef: MutableRefObject<MouseFollowRef>;
	lookAtEnabled?: boolean;
}

export function HeroR3FScene({ mouseRef, lookAtEnabled = true }: HeroR3FSceneProps): ReactElement {
	return (
		<Canvas
			dpr={[1, 2]}
			gl={{
				antialias: true,
				toneMapping: THREE.ACESFilmicToneMapping,
				toneMappingExposure: 1.15,
				outputColorSpace: THREE.SRGBColorSpace,
				powerPreference: "high-performance",
				alpha: true,
			}}
			camera={{ position: [0, 1.05, 1.85], fov: 32 }}
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

			<Suspense fallback={null}>
				<Environment preset="studio" background={false} />
				{/* GLB de Prism viene mirando +Z natural — sin rotación extra del group */}
				<group>
					<RobotLookAt mouseRef={mouseRef} enabled={lookAtEnabled} />
				</group>
				<ContactShadows
					position={[0, -1.1, 0]}
					opacity={0.55}
					scale={6}
					blur={2.6}
					far={1.5}
					color="#000000"
				/>
			</Suspense>

			<EffectComposer multisampling={4}>
				<SMAA />
				<Bloom intensity={0.4} luminanceThreshold={0.72} luminanceSmoothing={0.22} mipmapBlur />
			</EffectComposer>
		</Canvas>
	);
}
