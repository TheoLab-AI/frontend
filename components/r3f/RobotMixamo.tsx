"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, type ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";

/* =========================================================================
 * RobotMixamo — Robot R3F con animación Mixamo idle + LookAt al mouse
 *
 * SOLO para la ruta /protolab. NO tocar el RobotLookAt actual que vive en
 * /consultoria-legal (owner Alexis, usa modelo Tripo sin animación).
 *
 * El GLB robot-mixamo-v2.glb se rescató desde el commit cb5635e (que lo
 * creó, lo optimizó de 15 MB a 5 MB con meshopt + WebP 2K, y después se
 * dejó de usar en main). Mismo rig Mixamo Auto-Rigger del POC original
 * con la animación "Standing With Briefcase Idle" baked.
 *
 * Rig:
 *   - 52 bones con naming mixamorig:Head, mixamorig:Spine, etc.
 *   - 1 animation clip: "mixamo.com" (~14s loop, ~16k keyframes)
 *
 * Composición de movimiento:
 *
 *   1. useAnimations reproduce el clip en loop. Mueve TODOS los bones
 *      incluyendo head: respiración, peso entre piernas, mano simulando
 *      sostener un maletín. Esa es la "vida base" del personaje.
 *
 *   2. useFrame con priority default (0) corre DESPUÉS del mixer interno
 *      de drei (también priority 0, registrado primero por useAnimations).
 *      Aplica el delta del LookAt como quaternion.multiply ENCIMA de la
 *      rotación que la animación dejó en el head bone.
 *
 *   3. Resultado: pose base de la animación × LookAt al cursor. Las dos
 *      capas conviven sin pelearse — la cabeza respira Y mira al mouse.
 *
 * GLTFLoader normaliza nombres de bones: "mixamorig:Head" llega como
 * "mixamorigHead" en runtime (el ":" se elimina). Confirmado al cargar.
 *
 * enabled=false (prefers-reduced-motion): desactiva SOLO el LookAt. La
 * animación Mixamo sigue corriendo — es la idle natural del personaje,
 * no es disruptiva.
 * ========================================================================= */

const MODEL_URL = "/models/robot-mixamo-v2.glb";
const HEAD_BONE_NAME = "mixamorigHead";
const ANIMATION_NAME = "mixamo.com";

const HEAD_MAX_YAW = 0.42;
const HEAD_MAX_PITCH = 0.22;
const HEAD_LERP = 0.09;

// El GLB usa EXT_meshopt_compression + EXT_texture_webp — drei v10 trae los
// decoders built-in cuando se pasa `true` como tercer arg. NO preload eager:
// el modelo descarga cuando el Canvas monta (diferido a idle por el padre).

export interface MouseFollowRef {
	targetX: number;
	targetY: number;
	x: number;
	y: number;
}

interface RobotMixamoProps {
	mouseRef: MutableRefObject<MouseFollowRef>;
	enabled?: boolean;
}

export function RobotMixamo({ mouseRef, enabled = true }: RobotMixamoProps): ReactElement {
	const { scene, animations } = useGLTF(MODEL_URL, undefined, true);
	const { actions } = useAnimations(animations, scene);

	const headRef = useRef<THREE.Object3D | null>(null);

	const tmpEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
	const tmpQuat = useRef(new THREE.Quaternion());

	useEffect(() => {
		const result: { node: THREE.Object3D | null } = { node: null };
		scene.traverse((obj) => {
			if (obj.name === HEAD_BONE_NAME) result.node = obj;
		});
		if (!result.node) {
			scene.traverse((obj) => {
				if (!result.node && obj.name?.toLowerCase().endsWith("head")) {
					result.node = obj;
				}
			});
		}
		headRef.current = result.node;
	}, [scene]);

	useEffect(() => {
		const action = actions[ANIMATION_NAME];
		if (!action) return;
		action.reset().fadeIn(0.4).play();
		return () => {
			action.fadeOut(0.2);
		};
	}, [actions]);

	useFrame(() => {
		if (!enabled) return;
		const head = headRef.current;
		if (!head) return;

		const m = mouseRef.current;
		m.x += (m.targetX - m.x) * HEAD_LERP;
		m.y += (m.targetY - m.y) * HEAD_LERP;

		const yaw = m.x * HEAD_MAX_YAW;
		const pitch = -m.y * HEAD_MAX_PITCH;

		tmpEuler.current.set(pitch, yaw, 0, "YXZ");
		tmpQuat.current.setFromEuler(tmpEuler.current);

		// Multiplicamos para SUMAR el delta del LookAt encima de la animación,
		// SIN sobrescribirla. La animación deja head.quaternion en su pose por
		// frame; nosotros multiplicamos delta encima.
		head.quaternion.multiply(tmpQuat.current);
		head.updateMatrixWorld(true);
	});

	return <primitive object={scene} />;
}
