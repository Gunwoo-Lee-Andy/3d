"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { getLoaderByExtension, getFileExtension } from "@/lib/loaderFactory";
import {
  extractZipModel,
  extractTextureReferencesFromMTL,
  remapMTLTexturePaths,
} from "@/lib/zipProcessor";

interface ModelViewerProps {
  url: string;
  filename?: string;
}

export default function ModelViewer({ url, filename }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18181b);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 파일 확장자 감지
    const ext = filename
      ? getFileExtension(filename)
      : url.split("?")[0].split(".").pop();
    const actualExt = ext ? `.${ext}` : ".glb";

    function fitToScreen(obj: THREE.Object3D) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      obj.position.sub(center);
      camera.position.set(0, size * 0.3, size * 1.2);
      controls.update();
      scene.add(obj);
    }

    // ZIP 파일 처리
    if (actualExt === ".zip") {
      fetch(url)
        .then((res) => res.blob())
        .then(async (blob) => {
          const file = new File([blob], filename || "model.zip");
          const { objFile, mtlFile, textureFiles, mtlContent } =
            await extractZipModel(file);

          // 텍스처 Blob URL 맵 생성
          const blobUrlMap = new Map<string, string>();
          textureFiles.forEach((file, filename) => {
            const blobUrl = URL.createObjectURL(file);
            blobUrlMap.set(filename, blobUrl);
          });

          // MTL 경로 재매핑
          let remappedMtlContent = mtlContent;
          if (mtlContent) {
            remappedMtlContent = remapMTLTexturePaths(
              mtlContent,
              blobUrlMap
            );
          }

          // OBJ 로드
          const objBlob = await objFile.arrayBuffer();
          const objUrl = URL.createObjectURL(
            new Blob([objBlob], { type: "text/plain" })
          );

          // MTL 로드 (있으면)
          let materials: THREE.Material[] = [];

          if (remappedMtlContent) {
            const mtlBlob = new Blob([remappedMtlContent], {
              type: "text/plain",
            });
            const mtlUrl = URL.createObjectURL(mtlBlob);

            const mtlLoader = new MTLLoader();
            // MTL 로더는 상대 경로로 텍스처를 로드하려고 시도
            // createObjectURL은 blob: URL이므로, 텍스처 로딩이 실패할 수 있다
            // 대신 직접 MTL을 파싱하고 텍스처를 지정하는 방식 사용

            materials = loadMaterialsFromMtlContent(
              remappedMtlContent,
              blobUrlMap
            );
          }

          // OBJ 로드
          const objLoader = new OBJLoader();

          objLoader.load(objUrl, (object) => {
            // 재질 할당 (MTL이 있는 경우)
            if (materials.length > 0) {
              const material = materials[0];
              object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material = material;
                }
              });
            }
            fitToScreen(object);
            URL.revokeObjectURL(objUrl);
            blobUrlMap.forEach((blobUrl) => {
              URL.revokeObjectURL(blobUrl);
            });
          });
        })
        .catch((err) => {
          console.error("[ZIP load error]", err);
          // 폴백: 기본 메시지 표시
          const errorDiv = document.createElement("div");
          errorDiv.textContent = "ZIP 파일 로드 실패";
          errorDiv.className =
            "w-full h-full flex items-center justify-center text-red-400";
          mount.appendChild(errorDiv);
        });
    } else {
      // ZIP이 아닌 다른 포맷 처리
      const { loader, type } = getLoaderByExtension(actualExt);

      function fitToScreenGeometry(
        obj: THREE.Object3D | THREE.BufferGeometry
      ) {
        let targetObject: THREE.Object3D;

        if (obj instanceof THREE.BufferGeometry) {
          const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7,
          });
          targetObject = new THREE.Mesh(obj, material);
        } else {
          targetObject = obj as THREE.Object3D;
        }

        fitToScreen(targetObject);
      }

      // 포맷별 로딩
      if (type === "gltf") {
        (loader as any).load(url, (gltf: any) => {
          fitToScreen(gltf.scene);
        });
      } else if (type === "fbx") {
        (loader as any).load(url, (object: THREE.Group) => {
          fitToScreen(object);
        });
      } else if (type === "stl" || type === "ply" || type === "3mf") {
        (loader as any).load(url, (geometry: THREE.BufferGeometry) => {
          fitToScreenGeometry(geometry);
        });
      } else if (type === "collada") {
        (loader as any).load(url, (collada: any) => {
          fitToScreen(collada.scene);
        });
      } else if (type === "3ds") {
        (loader as any).load(url, (object: THREE.Group) => {
          fitToScreen(object);
        });
      } else if (type === "obj") {
        (loader as any).load(url, (object: THREE.Group) => {
          fitToScreen(object);
        });
      }
    }

    // Animate
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [url, filename]);

  return <div ref={mountRef} className="w-full h-full" />;
}

/**
 * MTL 콘텐츠에서 재질 파싱 및 생성 (간단한 구현)
 * 실제로는 MTLLoader를 사용하는 것이 낫지만, Blob URL 이슈 때문에 간단히 처리
 */
function loadMaterialsFromMtlContent(
  mtlContent: string,
  textureMap: Map<string, string>
): THREE.Material[] {
  const materials: THREE.Material[] = [];

  // 기본 재질 생성 (텍스처는 제한적으로 적용)
  const material = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.0,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });

  // 첫 번째 텍스처 찾기 (있으면)
  let textureLoaded = false;
  for (const [filename, blobUrl] of textureMap.entries()) {
    if (filename.toLowerCase().endsWith(".png")) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(blobUrl, (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      });
      textureLoaded = true;
      break;
    }
  }

  materials.push(material);
  return materials;
}
