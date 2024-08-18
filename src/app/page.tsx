"use client";
import * as THREE from "three";
import { Leva, useControls } from "leva";
import React, { CSSProperties, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PointMaterial,
  Points,
  RoundedBox,
  Text,
} from "@react-three/drei";
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

  const { zoom } = useControls({
    zoom: { value: 2, min: 1, max: 10, step: 0.1 },
  });

  useEffect(() => {
    camera.lookAt(targetPosition.current);
    camera.position.set(0, 1, 5); // Adjust to start from above the text
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
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = Math.min(scrollY / maxScroll, 1);
    const targetY = 10 - scrollFraction * 10;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.lookAt(targetPosition.current);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  });

  return null;
}

const Button: React.FC<{
  position?: [number, number, number];
  onClick?: () => void;
  children?: string | React.ReactNode;
}> = ({ position = [0, 0, 0], onClick, children = "Click Me" }) => {
  const { buttons } = useControls({
    buttons: [4.8, 1.5, 0.01],
  });
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={active ? 1.2 : 1}
      onClick={(e) => {
        e.stopPropagation();
        setActive(!active);
        if (onClick) onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox smoothness={4} radius={0.3} args={buttons}>
        <meshStandardMaterial color={"black"} />
      </RoundedBox>
      <Text
        position={[0, 0.01, 0.05]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </mesh>
  );
};

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

  const { lightIntensity, luminanceThreshold, luminanceSmoothing } = useControls({
    lightIntensity: { value: 1.5, min: 0.1, max: 10, step: 0.1 },
    luminanceThreshold: { value: 0.1, min: 0, max: 1, step: 0.1 },
    luminanceSmoothing: { value: 0.8, min: 0, max: 1, step: 0.1 },
  });

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
          {/* <Button position={[0, 0, -0.1]}>Click me</Button> */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={luminanceThreshold}
              luminanceSmoothing={luminanceSmoothing}
              intensity={lightIntensity}
            />
          </EffectComposer>
        </Canvas>
      </div>
      <Leva />
    </>
  );
}
