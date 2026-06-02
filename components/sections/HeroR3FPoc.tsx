"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { type ReactElement, Suspense } from "react";
import * as THREE from "three";
import { Robot } from "@/components/r3f/Robot";

/* =========================================================================
 * HeroR3FPoc — Proof of concept: render del robot via React Three Fiber
 *
 * V2 — fondo alabaster + lighting recalibrado para contraste con fondo claro.
 * Pipeline de rendering:
 *   - DPR retina (1..2)
 *   - antialias + SMAA postprocess
 *   - ACES Filmic Tone Mapping, exposure 1.0 (bajo para fondo claro)
 *   - sRGB output color space
 *   - Environment HDR "city" (mas neutro frio/calido que studio)
 *   - 3-point lighting reposicionado: key desde arriba-izquierda (drama)
 *   - ContactShadows oscuras sobre alabaster
 *   - Bloom restringido (luminanceThreshold 0.9) — fondo claro hace que los
 *     highlights dominen menos
 *   - OrbitControls activos para inspeccion 360 — solo POC
 *
 * NO toca el page actual de /diagnostico. Es ruta aparte en /r3f-poc.
 * ========================================================================= */

export default function HeroR3FPoc(): ReactElement {
	return (
		<div className="relative h-screen w-screen overflow-hidden bg-[var(--color-alabaster)]">
			{/* Overlay info para el POC — esquina inferior izquierda */}
			<div className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-md font-mono text-[11px] leading-relaxed uppercase tracking-[0.14em] text-[var(--color-onyx)]/55">
				<p className="text-[var(--color-onyx)]/80">R3F POC · robot HD · v2</p>
				<p>DPR retina · ACES · Environment city · Bloom suave · bg alabaster</p>
				<p className="mt-2 normal-case tracking-normal text-[var(--color-onyx)]/40">
					Arrastra para rotar · rueda para zoom · click derecho para pan
				</p>
			</div>

			<Canvas
				dpr={[1, 2]}
				gl={{
					antialias: true,
					toneMapping: THREE.ACESFilmicToneMapping,
					toneMappingExposure: 1.0,
					outputColorSpace: THREE.SRGBColorSpace,
					powerPreference: "high-performance",
				}}
				camera={{ position: [0, 0.4, 3.2], fov: 35 }}
				shadows
			>
				{/* Iluminacion 3-point reposicionada:
				    - Key desde arriba-izquierda (en lugar de derecha) para drama distinto
				    - Fill calido desde derecha-frontal
				    - Rim azul desde atras-bajo para dibujar contorno contra alabaster */}
				<ambientLight intensity={0.4} />
				<directionalLight
					position={[-4, 6, 4]}
					intensity={1.5}
					castShadow
					shadow-mapSize={[2048, 2048]}
					shadow-bias={-0.0001}
				/>
				<directionalLight position={[4, 1.5, 2]} intensity={0.6} color="#ffd7a0" />
				<directionalLight position={[0, 0.5, -6]} intensity={0.9} color="#a0c4ff" />

				<Suspense fallback={null}>
					<Environment preset="city" background={false} />
					{/* Pivot del GLB sale rotado 90° en Y — corregimos aqui para que mire a la camara */}
					<group rotation={[0, -Math.PI / 2, 0]}>
						<Robot />
					</group>
					<ContactShadows
						position={[0, -1.1, 0]}
						opacity={0.45}
						scale={6}
						blur={2.6}
						far={1.5}
						color="#0a0a0a"
					/>
				</Suspense>

				<OrbitControls
					enablePan={false}
					enableZoom={true}
					minDistance={1.8}
					maxDistance={6}
					target={[0, 0.2, 0]}
				/>

				<EffectComposer multisampling={4}>
					<SMAA />
					<Bloom intensity={0.25} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
				</EffectComposer>
			</Canvas>
		</div>
	);
}

export { HeroR3FPoc };
