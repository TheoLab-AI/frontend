"use client";

import { useGLTF } from "@react-three/drei";
import type { ReactElement } from "react";

/* =========================================================================
 * Robot — R3F POC
 *
 * Carga el GLB del robot-abogado desde /public/models/robot.glb y lo monta
 * como primitive object. PBR materials (metalness/roughness/normal) y
 * texturas embebidas se respetan automaticamente via useGLTF de drei.
 *
 * NOTA POC: aqui solo cargamos. El mouse-follow Look-At se cablea en el
 * paso de produccion una vez que separemos head/body del mesh.
 * ========================================================================= */

const MODEL_URL = "/models/robot.glb";

// Preload al modulo: comienza el fetch del GLB en cuanto el bundle de cliente
// se evalua, antes de que el componente monte. Suspense del Canvas se encarga
// del wait.
// Args: (path, useDraco?, useMeshOpt?) — el GLB esta comprimido con EXT_meshopt_compression
useGLTF.preload(MODEL_URL, undefined, true);

export function Robot(): ReactElement {
	const { scene } = useGLTF(MODEL_URL, undefined, true);
	return <primitive object={scene} />;
}
