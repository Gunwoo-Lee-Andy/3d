"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getLoaderByExtension, getFileExtension } from "@/lib/loaderFactory";

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

    const { loader, type } = getLoaderByExtension(
      actualExt,
      new THREE.LoadingManager()
    );

    // 로더에 따라 처리
    function fitToScreen(
      obj: THREE.Object3D | THREE.BufferGeometry | THREE.Group
    ) {
      let targetObject: THREE.Object3D;

      // BufferGeometry인 경우 Mesh로 변환
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

      const box = new THREE.Box3().setFromObject(targetObject);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      targetObject.position.sub(center);
      camera.position.set(0, size * 0.3, size * 1.2);
      controls.update();
      scene.add(targetObject);
    }

    // 포맷별 로딩 로직
    if (type === "gltf") {
      (loader as any).load(url, (gltf: any) => {
        fitToScreen(gltf.scene);
      });
    } else if (type === "fbx") {
      (loader as any).load(url, (object: THREE.Group) => {
        fitToScreen(object);
      });
    } else if (type === "stl" || type === "ply" || type === "3mf") {
      // 이 로더들은 BufferGeometry 반환
      (loader as any).load(url, (geometry: THREE.BufferGeometry) => {
        fitToScreen(geometry);
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
      // OBJ는 Group으로 반환
      (loader as any).load(url, (object: THREE.Group) => {
        fitToScreen(object);
      });
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
