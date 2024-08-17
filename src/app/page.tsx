"use client";
import * as THREE from "three";
import { Leva, useControls } from "leva";
import sx from "./page.module.scss";
import { CSSProperties, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointMaterial, Points, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function Galaxy() {
  const pointsRef = useRef<THREE.Points>(null);

  const numStars = 6000;
  const positions = new Float32Array(numStars * 3);

  for (let i = 0; i < numStars; i++) {
    const distance = Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * distance;
    const y = (Math.random() - 0.5) * 2;
    const z = Math.sin(angle) * distance;
    positions.set([x, y, z], i * 3);
  }

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="white"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

function Box(props: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh position={props.position} ref={meshRef}>
      <Text fontSize={1} color="#80dfff" anchorX="center" anchorY="middle">
        M Majid
      </Text>
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
}

function CameraControl() {
  const { camera } = useThree();
  const [scrollY, setScrollY] = useState(0);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0)); // Position to focus on
  
  // Set default zoom properties
  const { zoom } = useControls({
    zoom: { value: 2, min: 1, max: 10, step: 0.1 },
  });
  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 1, 1); // Adjust to start from above the text
    camera.lookAt(targetPosition.current);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, zoom]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = Math.min(scrollY / maxScroll, 1);

    // Smoothly interpolate camera position using lerp
    const targetY = 5 - scrollFraction * 10;
    camera.position.y += (targetY - camera.position.y) * 0.1;

    // Ensure camera always points at the center or specific object
    camera.lookAt(targetPosition.current);

    // Adjust zoom level
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  });

  return null;
}

export default function Home() {
  const canvasStyle: CSSProperties = {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: "hidden",
  };

  return (
    <>
      <div style={{ height: "200vh" }}>
        <Canvas style={canvasStyle}>
          <CameraControl />
          <OrbitControls maxZoom={50} minZoom={50} />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.2}
            color="#aabbff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={1.5}
            color="#aabbff"
            castShadow
          />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.7}
            color="#aabbff"
          />
          <Galaxy />
          <Box position={[0, 0, 0]} />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.1}
              luminanceSmoothing={0.8}
              intensity={0.6}
            />
          </EffectComposer>
        </Canvas>
      </div>
      <Leva />
    </>
  );
}
