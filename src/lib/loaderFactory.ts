import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

export type ModelLoader =
  | GLTFLoader
  | FBXLoader
  | OBJLoader
  | STLLoader
  | PLYLoader
  | ColladaLoader
  | TDSLoader
  | ThreeMFLoader;

/**
 * 파일 확장자에 따라 적절한 Three.js 로더를 반환
 */
export function getLoaderByExtension(
  ext: string,
  manager?: THREE.LoadingManager
): { loader: ModelLoader; type: string } {
  const extensionMap: Record<
    string,
    { create: () => ModelLoader; type: string }
  > = {
    ".glb": { create: () => new GLTFLoader(manager), type: "gltf" },
    ".gltf": { create: () => new GLTFLoader(manager), type: "gltf" },
    ".fbx": { create: () => new FBXLoader(manager), type: "fbx" },
    ".obj": { create: () => new OBJLoader(manager), type: "obj" },
    ".stl": { create: () => new STLLoader(manager), type: "stl" },
    ".ply": { create: () => new PLYLoader(manager), type: "ply" },
    ".dae": { create: () => new ColladaLoader(manager), type: "collada" },
    ".3ds": { create: () => new TDSLoader(manager), type: "3ds" },
    ".3mf": { create: () => new ThreeMFLoader(manager), type: "3mf" },
  };

  const cleanExt = ext.toLowerCase();
  const config = extensionMap[cleanExt];

  if (!config) {
    // 기본값: GLTFLoader (GLB/GLTF 형식)
    return { loader: new GLTFLoader(manager), type: "gltf" };
  }

  return {
    loader: config.create(),
    type: config.type,
  };
}

/**
 * 파일명/URL에서 확장자 추출
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0] : "";
}
