"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { type MutableRefObject, type ReactElement, Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { type MouseFollowRef, RobotMixamo } from "@/components/r3f/RobotMixamo";
import { useConversationStore } from "@/lib/conversation-store";

/* =========================================================================
 * RobotScene — Canvas R3F para la ruta /protolab
 *
 * Extiende el setup visual de HeroR3FScene (misma cámara, luces, environment,
 * postprocesado) con animación de cabeza impulsada por el estado conversacional
 * del store Zustand.
 *
 * --- Composición de animaciones ---
 *
 * RobotLookAt registra un useFrame (priority 0) que en cada frame:
 *   1. Lerp del mouse (interno).
 *   2. head.quaternion.copy(baseQuat).multiply(lookAtQuat)
 *      → sobreescribe la quaternion con [pose base × LookAt].
 *
 * ConversationHeadLayer (componente de este archivo) registra su propio
 * useFrame (también priority 0) declarado DESPUÉS en el árbol React. R3F
 * ejecuta los callbacks de useFrame en orden de registro FIFO dentro de la
 * misma prioridad. Al ser hijo de RobotLookAt en el JSX, su useFrame
 * se registra después y siempre corre TRAS el LookAt.
 *
 * En ese frame posterior, el nod se aplica como:
 *   head.quaternion.multiply(nodDeltaQuat)
 *   head.updateMatrixWorld(true)
 *
 * Es decir: [pose base × LookAt × nodDelta]. Nunca se sobreescribe el LookAt.
 *
 * IMPORTANTE: NO usar priority > 0 para forzar el orden. En R3F, un Canvas
 * con frameloop="demand" o con cualquier useFrame con priority != 0 deshabilita
 * el auto-render del loop interno y requiere llamar manualmente invalidate().
 * Se usa el ordering FIFO de priority 0 que es seguro y no rompe el render loop.
 *
 * --- Bone naming ---
 *
 * El GLTFLoader sanitiza los nombres de nodos: elimina caracteres reservados
 * (`:` `.` `/` `[` `]`). "tripo::Head_0" llega como "tripoHead_0" en runtime.
 * ConversationHeadLayer busca el bone con la misma función de normalización
 * que usa RobotLookAt para garantizar consistencia (ver HEAD_BONE_NORMALIZED).
 *
 * --- Estados ---
 *
 * idle     : solo Mixamo idle + LookAt. ConversationHeadLayer no aplica delta.
 * listening: tilt estático -0.08 rad en X (cabeza ligeramente adelante).
 *            Lerp hacia ese target; no nod. Sin movimiento visible = OK con
 *            prefers-reduced-motion (es una postura, no animación periódica).
 * speaking : nod proporcional a audioLevel. Target X = audioLevel * 0.18 rad
 *            más una oscilación de línea base (0.025 * sin(time * 6)) para que
 *            la cabeza nunca se congele entre sílabas cuando audioLevel ~ 0.
 *            Lerp 0.15 — más rápido que el LookAt (0.09) para que el nod sea
 *            perceptible en habla natural.
 *
 * prefers-reduced-motion: deshabilita SOLO el nod speaking. El tilt listening
 * es estático (no movimiento periódico), se conserva. El idle clip y el LookAt
 * viven en RobotLookAt y se controlan desde ahí con su prop `enabled`.
 *
 * --- Canvas ---
 *
 * className="h-full w-full" — el layout lo define app/protolab/page.tsx.
 * Sin RobotPoster (no hay presión LCP: el robot está below the fold en
 * protolab; el tiempo de carga del GLB no afecta Core Web Vitals).
 * ========================================================================= */

// Bone canonical name en el GLB Mixamo. El GLTFLoader normaliza "mixamorig:Head"
// quitando el ":" — llega como "mixamorigHead" en runtime.
const HEAD_BONE_PROTOLAB = "mixamorigHead";

// Normalize: elimina todo carácter no alfanumérico, lowercase.
// Mismo algoritmo que RobotLookAt usa internamente.
const normBoneName = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
const HEAD_BONE_NORMALIZED = normBoneName(HEAD_BONE_PROTOLAB);

// Amplitudes del nod — conservadoras para no sobresaturar el canal visual.
// El LookAt ya usa hasta 0.42 rad de yaw; el nod se mantiene debajo.
const NOD_SPEAK_MAX = 0.18; // rad; ~10° en pico audioLevel=1
const NOD_LISTEN_TILT = -0.08; // rad; ~4.5° adelante (negativo = inclinación down)
const NOD_BASELINE_AMP = 0.025; // rad; oscilación de línea base entre sílabas
const NOD_BASELINE_FREQ = 6.0; // rad/s; ~1 ciclo/s — imperceptible pero evita freeze
const NOD_LERP = 0.15; // más rápido que LookAt (0.09) para presencia conversacional

/* -------------------------------------------------------------------------
 * ConversationHeadLayer
 *
 * Componente vacío (no renderiza nada) que únicamente registra un useFrame.
 * Se monta DENTRO del Suspense que también contiene RobotLookAt para garantizar
 * que ambos comparten el mismo ciclo de render.
 *
 * Por qué componente separado y no una función dentro de RobotScene:
 *   - useFrame solo puede llamarse dentro de un componente hijo del Canvas.
 *   - Mantener la lógica aislada facilita el testing y el razonamiento sobre
 *     el orden de ejecución.
 *
 * Recibe `sceneRef` — una referencia al grupo raíz para poder traversar y
 * encontrar el head bone. Se busca en cada frame si headRef.current es null
 * (lazy find, cheap: traverse se rompe al encontrar el primer match).
 * ------------------------------------------------------------------------- */
interface ConversationHeadLayerProps {
	sceneRef: MutableRefObject<THREE.Group | null>;
	reducedMotion: boolean;
}

function ConversationHeadLayer({ sceneRef, reducedMotion }: ConversationHeadLayerProps): null {
	const status = useConversationStore((s) => s.status);
	const audioLevel = useConversationStore((s) => s.audioLevel);

	// Refs internos — sin re-render.
	const headRef = useRef<THREE.Object3D | null>(null);
	const currentTiltX = useRef(0); // valor actual interpolado
	const tmpQuat = useRef(new THREE.Quaternion());
	const tmpEuler = useRef(new THREE.Euler(0, 0, 0, "XYZ"));

	// Snapshotear status/audioLevel en refs para acceso sin closure stale.
	const statusRef = useRef(status);
	const audioLevelRef = useRef(audioLevel);
	useEffect(() => {
		statusRef.current = status;
	}, [status]);
	useEffect(() => {
		audioLevelRef.current = audioLevel;
	}, [audioLevel]);

	useFrame(({ clock }) => {
		const scene = sceneRef.current;
		if (!scene) return;

		// Lazy find del bone — solo traversa si aún no lo tenemos.
		if (!headRef.current) {
			scene.traverse((obj) => {
				if (!headRef.current && normBoneName(obj.name) === HEAD_BONE_NORMALIZED) {
					headRef.current = obj;
				}
			});
			// Si tras traversar sigue null, el scene no ha cargado aún.
			if (!headRef.current) return;
		}

		const head = headRef.current;
		const st = statusRef.current;
		const level = audioLevelRef.current;
		const t = clock.elapsedTime;

		// Calcular target de tilt según estado.
		let targetX = 0;
		if (st === "listening") {
			targetX = NOD_LISTEN_TILT;
		} else if (st === "speaking") {
			if (reducedMotion) {
				// Sin movimiento periódico: solo tilt mínimo proporcional.
				targetX = level * NOD_SPEAK_MAX * 0.3;
			} else {
				// Nod proporcional + oscilación de línea base.
				const baseline = NOD_BASELINE_AMP * Math.sin(t * NOD_BASELINE_FREQ);
				targetX = level * NOD_SPEAK_MAX + baseline;
			}
		}
		// idle: targetX = 0, el lerp devuelve currentTiltX a 0.

		// Lerp suave hacia el target.
		currentTiltX.current += (targetX - currentTiltX.current) * NOD_LERP;

		// Si el delta es despreciable, no contaminar la quaternion.
		if (Math.abs(currentTiltX.current) < 0.0005) return;

		// Multiplicar el delta como quaternion local encima de lo que LookAt dejó.
		// Patrón idéntico al de RobotLookAt: multiply — no copy, no set directo.
		tmpEuler.current.set(currentTiltX.current, 0, 0, "XYZ");
		tmpQuat.current.setFromEuler(tmpEuler.current);
		head.quaternion.multiply(tmpQuat.current);
		head.updateMatrixWorld(true);
	});

	return null;
}

/* -------------------------------------------------------------------------
 * useMouseFollow — listener global de mousemove normalizado a -1..1
 *
 * Extraído a un hook para reutilizarlo en protolab sin duplicar la lógica
 * de HeroR3F. El mismo patrón: escuchar en window (no en el Canvas) para
 * capturar movimiento aunque el cursor salga del rect del Canvas.
 *
 * El ref se actualiza en cada mousemove sin disparar re-renders.
 * reducedMotion=true: no registra el listener, el ref queda en { 0, 0, 0, 0 }.
 * ------------------------------------------------------------------------- */
function useMouseFollow(reducedMotion: boolean): MutableRefObject<MouseFollowRef> {
	const mouseRef = useRef<MouseFollowRef>({ targetX: 0, targetY: 0, x: 0, y: 0 });

	useEffect(() => {
		if (reducedMotion) return;
		if (typeof window === "undefined") return;

		const handleMove = (e: MouseEvent) => {
			mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
			mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
		};

		const handleLeave = () => {
			mouseRef.current.targetX = 0;
			mouseRef.current.targetY = 0;
		};

		window.addEventListener("mousemove", handleMove, { passive: true });
		window.addEventListener("mouseout", handleLeave);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseout", handleLeave);
		};
	}, [reducedMotion]);

	return mouseRef;
}

/* -------------------------------------------------------------------------
 * RobotSceneInner — contenido del Canvas (debe ser child del Canvas)
 *
 * Separado de RobotScene para cumplir la regla de R3F: useFrame y primitivos
 * three.js solo son válidos dentro del contexto del Canvas.
 * ------------------------------------------------------------------------- */
interface RobotSceneInnerProps {
	mouseRef: MutableRefObject<MouseFollowRef>;
	lookAtEnabled: boolean;
	reducedMotion: boolean;
}

function RobotSceneInner({
	mouseRef,
	lookAtEnabled,
	reducedMotion,
}: RobotSceneInnerProps): ReactElement {
	// Ref al group que wrappea el scene del GLB. Se pasa a ConversationHeadLayer
	// para que pueda traversar y encontrar el head bone.
	// useRef es estable entre renders — se pasa directamente sin memo.
	const sceneRef = useRef<THREE.Group | null>(null);

	return (
		<>
			{/* Iluminacion bajada vs HeroR3F para look MATE/CINEMATICO.
			    Antes el robot se veia "plastico encerado" con las intensidades
			    altas. Bajamos key/rim/ambient para que el traje lea como tela
			    en penumbra editorial. Brand colors conservados: key calido,
			    fill frio, rim oro — solo cambian intensidades. */}
			<ambientLight intensity={0.22} />
			<directionalLight
				position={[4, 5.5, 3.5]}
				intensity={1.0}
				color="#fff4dc"
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-bias={-0.0001}
			/>
			<directionalLight position={[-3.5, 1.2, 2.5]} intensity={0.35} color="#a0c4ff" />
			<directionalLight position={[0, -0.2, -5]} intensity={0.55} color="#f6c060" />

			<Suspense fallback={null}>
				{/* Preset "warehouse" da reflejos mas sobrios que "studio" — menos
				    highlights de chrome en el traje, look mas mate. */}
				<Environment preset="warehouse" background={false} />
				{/* group position Y=-0.7 baja el robot para un encuadre rodillas-arriba
				    (medium close-up). Con camara [0, 0.05, 2.0] fov 42, frustum vertical
				    ~1.54u: cabeza (Y=0.8 world) cerca del top, rodillas (Y=-0.7 world)
				    cerca del bottom, cintura y torso en el centro. */}
				<group ref={sceneRef} position={[0, -0.7, 0]}>
					{/* RobotMixamo registra su useFrame (priority 0) primero.
					    ConversationHeadLayer (debajo) registra el suyo después.
					    FIFO garantiza: RobotMixamo → ConversationHeadLayer. */}
					<RobotMixamo mouseRef={mouseRef} enabled={lookAtEnabled} />
					<ConversationHeadLayer sceneRef={sceneRef} reducedMotion={reducedMotion} />
				</group>
				{/* Shadow Y=-1.2 (pies = -0.5 del modelo + shift -0.7). Con encuadre
				    rodillas-arriba la sombra queda fuera de frame pero ayuda al GI. */}
				<ContactShadows
					position={[0, -1.2, 0]}
					opacity={0.4}
					scale={6}
					blur={2.6}
					far={1.5}
					color="#000000"
				/>
			</Suspense>

			<EffectComposer multisampling={8}>
				<SMAA />
				{/* Bloom muy bajo + threshold alto: solo highlights extremos brillan.
				    Antes el bloom era el principal culpable del "plastico". */}
				<Bloom intensity={0.18} luminanceThreshold={0.88} luminanceSmoothing={0.18} mipmapBlur />
			</EffectComposer>
		</>
	);
}

/* -------------------------------------------------------------------------
 * RobotScene — export público
 *
 * Wrappea RobotSceneInner en su propio Canvas. Layout definido por el padre
 * (app/protolab/page.tsx) — este componente solo exige que el padre tenga
 * altura definida (className="h-full w-full" en el Canvas).
 *
 * No hay RobotPoster: la ruta /protolab es below the fold, sin presión LCP.
 * La experiencia conversacional requiere interacción del usuario antes de
 * ser relevante, así que el GLB puede cargar a demanda sin poster.
 *
 * prefers-reduced-motion se lee aquí (en el client boundary) para pasarlo
 * tanto a useMouseFollow (deshabilita el listener) como a RobotLookAt
 * (via lookAtEnabled) y a ConversationHeadLayer (deshabilita nod periódico).
 * ------------------------------------------------------------------------- */
interface RobotSceneProps {
	/** Controla si prefers-reduced-motion está activo. El padre puede
	 *  obtenerlo con useReducedMotion() de motion/react y pasarlo aquí. */
	reducedMotion?: boolean;
}

export function RobotScene({ reducedMotion = false }: RobotSceneProps): ReactElement {
	const mouseRef = useMouseFollow(reducedMotion);

	return (
		<Canvas
			className="h-full w-full"
			dpr={[1.5, 2.5]}
			gl={{
				antialias: true,
				toneMapping: THREE.ACESFilmicToneMapping,
				toneMappingExposure: 0.85,
				outputColorSpace: THREE.SRGBColorSpace,
				powerPreference: "high-performance",
				alpha: true,
			}}
			camera={{ position: [0, 0.05, 2.0], fov: 42 }}
			shadows
			style={{ background: "transparent" }}
		>
			<RobotSceneInner
				mouseRef={mouseRef}
				lookAtEnabled={!reducedMotion}
				reducedMotion={reducedMotion}
			/>
		</Canvas>
	);
}
