"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, type ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";

/* =========================================================================
 * RobotLookAt — Robot R3F con LookAt al mouse sobre el head bone
 *
 * Carga el GLB rigged desde /public/models/robot.glb. El rig tiene naming
 * Tripo (no Mixamo): el bone de cabeza se llama `tripo::Head_0` (sub-bone
 * `tripo::Head_1` cuelga de él). Se rota EL bone — no el group entero —
 * para que solo la cabeza siga al mouse, dejando el resto del cuerpo en
 * pose natural.
 *
 * El parent (HeroR3F) captura mousemove global y normaliza a -1..1 en un
 * ref mutable. Aquí dentro del Canvas, `useFrame` consume ese ref con lerp
 * suave (ROBOT_LERP) y aplica el delta como quaternion local sobre la pose
 * base del bone (preservando el rest pose del rig).
 *
 * Amplitudes deliberadamente más conservadoras que el Spline original
 * (yaw 0.42 vs 0.55, pitch 0.22 vs 0.28) porque ahora rota SOLO la cabeza,
 * no el cuerpo entero — los ángulos se notan más con menos rotación.
 *
 * `enabled=false` (prefers-reduced-motion) congela la cabeza en su rest pose.
 * ========================================================================= */

const MODEL_URL = "/models/robot.glb";
const HEAD_BONE_NAME = "tripo::Head_0";

const HEAD_MAX_YAW = 0.42;
const HEAD_MAX_PITCH = 0.22;
const HEAD_LERP = 0.09;

// El modelo PBR usa EXT_meshopt_compression — drei v10 trae el decoder built-in
// cuando se pasa `true` como tercer arg.
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
	const { scene } = useGLTF(MODEL_URL, undefined, true);
	const headRef = useRef<THREE.Object3D | null>(null);
	const baseQuatRef = useRef<THREE.Quaternion | null>(null);

	// Buffers persistentes para evitar allocaciones en cada frame.
	const tmpEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
	const tmpQuat = useRef(new THREE.Quaternion());

	useEffect(() => {
		// Wrapper objeto para evitar el narrowing de TS5 sobre `let` mutado
		// dentro del closure de `traverse` (que infiere `never` al salir).
		const result: { node: THREE.Object3D | null } = { node: null };
		scene.traverse((obj) => {
			if (obj.name === HEAD_BONE_NAME) result.node = obj;
		});
		headRef.current = result.node;
		if (result.node) {
			baseQuatRef.current = result.node.quaternion.clone();
		} else if (process.env.NODE_ENV !== "production") {
			// eslint-disable-next-line no-console
			console.warn(
				`[RobotLookAt] Head bone "${HEAD_BONE_NAME}" no encontrado en el GLB. ` +
					`LookAt deshabilitado. Bones disponibles en runtime: usa scene.traverse para inspeccionar.`,
			);
		}
	}, [scene]);

	useFrame(() => {
		if (!enabled) return;
		const head = headRef.current;
		const baseQuat = baseQuatRef.current;
		if (!head || !baseQuat) return;

		const m = mouseRef.current;
		m.x += (m.targetX - m.x) * HEAD_LERP;
		m.y += (m.targetY - m.y) * HEAD_LERP;

		// Yaw a la derecha cuando el cursor va a la derecha; pitch hacia abajo
		// cuando el cursor sube. El signo del pitch se invierte respecto al cursor
		// raw (cursor sube = clientY baja = m.y negativo, pero queremos que la
		// cabeza se incline ARRIBA = rotation.x positivo en el bone local-frame).
		const yaw = m.x * HEAD_MAX_YAW;
		const pitch = -m.y * HEAD_MAX_PITCH;

		tmpEuler.current.set(pitch, yaw, 0, "YXZ");
		tmpQuat.current.setFromEuler(tmpEuler.current);
		head.quaternion.copy(baseQuat).multiply(tmpQuat.current);
	});

	return <primitive object={scene} />;
}
