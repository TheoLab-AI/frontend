"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, type ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";

/* =========================================================================
 * RobotLookAt — Robot R3F con Mixamo idle animation + LookAt al mouse
 *
 * El GLB en /public/models/robot.glb fue re-rigeado en Mixamo (Auto-Rigger)
 * con la animación "Standing With Briefcase Idle" bakeada. Ya NO usa el rig
 * Prism v2.5 con naming Tripo de Fase 2 — ese se descartó porque NO era
 * compatible plug-and-play con animaciones Mixamo (estructura distinta de
 * bones, sin dedos, sin subdivisión de columna).
 *
 * El rig actual:
 *   - 52 bones con naming mixamorig (`mixamorig:Head`, `mixamorig:Spine`,
 *     `mixamorig:LeftArm`, etc.)
 *   - 1 animation clip: "mixamo.com" (53 channels, ~14 s, 16,692 keyframes)
 *   - Optimizado con meshopt + WebP 2K: 81 MB → 15 MB (-81%)
 *
 * Estrategia de composición de movimiento:
 *
 *   1. `useAnimations` de drei reproduce el clip "mixamo.com" en loop.
 *      Esto mueve TODOS los bones incluyendo el head, el cuerpo respira,
 *      cambia peso entre piernas, y la mano simula sostener un maletín.
 *
 *   2. `useFrame` con `priority={1}` se ejecuta DESPUÉS de mixer.update()
 *      (drei usa priority 0 por default). Aquí encima de la pose del clip,
 *      sumo una rotación al head bone para que la cabeza siga al mouse.
 *      `head.quaternion.multiply(deltaQuat)` aplica el LookAt encima de
 *      la rotación de la animación, sin sobreescribirla.
 *
 *   3. Resultado: el cuerpo y la cabeza tienen el "alma" de la animación
 *      Mixamo (movimientos sutiles humanos baked por animador profesional),
 *      Y la cabeza adicionalmente sigue al cursor en tiempo real. Las dos
 *      capas se combinan sin pelearse.
 *
 * `enabled=false` (prefers-reduced-motion): desactiva SOLO el LookAt. La
 * animación Mixamo sigue corriendo porque es el "idle natural" del personaje,
 * no es disruptivo.
 * ========================================================================= */

// Path con sufijo "-v2" para forzar cache-bust en el browser. El GLB v1
// pesaba 15 MB; v2 está optimizado a 5 MB (texturas 1K + simplify mesh
// a 320K vertices + meshopt + WebP q88). Mismo rig, misma animation,
// nueva URL fuerza re-fetch en browsers que cacheaban el archivo viejo.
const MODEL_URL = "/models/robot-mixamo-v2.glb";
// Importante: el GLB raw tiene los bones con naming "mixamorig:Head" (con
// dos puntos), pero el GLTFLoader de three.js / drei NORMALIZA los nombres
// durante el load — sanitiza el `:` removiéndolo. En runtime el bone está
// disponible como "mixamorigHead" (sin separador). Si buscamos "mixamorig:
// Head" no lo encontramos y headRef queda null → useFrame retorna early →
// LookAt no se aplica. Confirmado vía console.log de allBones en preview.
const HEAD_BONE_NAME = "mixamorigHead";
const ANIMATION_NAME = "mixamo.com";

// Amplitudes deliberadamente AMPLIAS para que el LookAt sea claramente
// visible. Si despues se siente exagerado, bajar a 0.30 / 0.18.
const HEAD_MAX_YAW = 0.55; // ~31° horizontal
const HEAD_MAX_PITCH = 0.3; // ~17° vertical
const HEAD_LERP = 0.12; // converge mas rapido (0.09 anterior era muy suave)

// El GLB usa EXT_meshopt_compression + EXT_texture_webp — drei v10 trae los
// decoders built-in cuando se pasa `true` como tercer arg.
useGLTF.preload(MODEL_URL, undefined, true);

export interface MouseFollowRef {
	targetX: number;
	targetY: number;
	x: number;
	y: number;
}

interface RobotLookAtProps {
	mouseRef: MutableRefObject<MouseFollowRef>;
	enabled?: boolean;
}

export function RobotLookAt({ mouseRef, enabled = true }: RobotLookAtProps): ReactElement {
	const { scene, animations } = useGLTF(MODEL_URL, undefined, true);
	const { actions } = useAnimations(animations, scene);

	const headRef = useRef<THREE.Object3D | null>(null);

	// Buffers persistentes para evitar allocaciones en cada frame.
	const tmpEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
	const tmpQuat = useRef(new THREE.Quaternion());

	// 1. Resolver el head bone una sola vez al montar.
	useEffect(() => {
		const result: { node: THREE.Object3D | null } = { node: null };
		scene.traverse((obj) => {
			if (obj.name === HEAD_BONE_NAME) result.node = obj;
		});
		headRef.current = result.node;
		if (!result.node && process.env.NODE_ENV !== "production") {
			// eslint-disable-next-line no-console
			console.warn(
				`[RobotLookAt] Head bone "${HEAD_BONE_NAME}" no encontrado. LookAt deshabilitado.`,
			);
		}
	}, [scene]);

	// 2. Reproducir el clip Mixamo en loop al montar.
	useEffect(() => {
		const action = actions[ANIMATION_NAME];
		if (!action) {
			if (process.env.NODE_ENV !== "production") {
				// eslint-disable-next-line no-console
				console.warn(
					`[RobotLookAt] Animation clip "${ANIMATION_NAME}" no encontrado. ` +
						`Clips disponibles: ${Object.keys(actions).join(", ") || "(ninguno)"}`,
				);
			}
			return;
		}
		action.reset().fadeIn(0.4).play();
		return () => {
			action.fadeOut(0.2);
		};
	}, [actions]);

	// 3. LookAt aplicado ENCIMA de la animación.
	//
	//    Importante: NO pasar renderPriority (segundo arg de useFrame). Pasar
	//    priority > 0 desactiva el render loop automático de R3F (Canvas no
	//    llama gl.render por sí solo cuando hay useFrames con priority > 0).
	//    En su lugar, dejamos priority default (0) y nos apoyamos en el orden
	//    de declaración: este useFrame se registra DESPUÉS del useAnimations
	//    de arriba, así que se ejecuta después del mixer.update() interno —
	//    el head.quaternion ya tiene la rotación de la animación cuando
	//    llegamos aquí, y multiplicamos el delta del LookAt encima.
	useFrame(() => {
		if (!enabled) return;
		const head = headRef.current;
		if (!head) return;

		const m = mouseRef.current;
		m.x += (m.targetX - m.x) * HEAD_LERP;
		m.y += (m.targetY - m.y) * HEAD_LERP;

		// Yaw a la derecha cuando el cursor va a la derecha; pitch hacia arriba
		// cuando el cursor sube. m.y es positivo abajo (clientY), por eso lo
		// negamos para que rotation.x positivo = cabeza arriba.
		const yaw = m.x * HEAD_MAX_YAW;
		const pitch = -m.y * HEAD_MAX_PITCH;

		tmpEuler.current.set(pitch, yaw, 0, "YXZ");
		tmpQuat.current.setFromEuler(tmpEuler.current);

		// head.quaternion ya contiene la rotación de la animación en este frame.
		// Multiplicamos para sumar el delta del LookAt SIN sobrescribir la animation.
		head.quaternion.multiply(tmpQuat.current);
	});

	return <primitive object={scene} />;
}
