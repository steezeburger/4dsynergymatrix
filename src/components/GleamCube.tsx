import React, { useRef, useState, useMemo } from "react";
import { useFrame, MeshProps } from "@react-three/fiber";
import { Mesh, EdgesGeometry, LineBasicMaterial, LineSegments, ShaderMaterial, Group } from "three";

type Cylinder3dProps = {
  wireframe?: boolean;
  position?: [number, number, number];
} & MeshProps;

const GleamCube: React.FC<Cylinder3dProps> = (props) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.01;
      groupRef.current.rotation.z += 0.01;
    }
  });

  const outline = useMemo(() => {
    if (meshRef.current) {
      const edgesGeometry = new EdgesGeometry(meshRef.current.geometry);
      const lineMaterial = new LineBasicMaterial({ color: "black" });
      return new LineSegments(edgesGeometry, lineMaterial);
    }
  }, [meshRef.current]);

  const gridShaderMaterial = new ShaderMaterial({
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      void main() {
        vec3 color = vec3(0.0, 1.0, 0.0);
        float lineWidth = 0.005;
        float gridSize = 10.0;
        vec3 modPosition = mod(vPosition * gridSize + 0.5, 1.0);
        float mask = step(lineWidth, modPosition.x) * step(lineWidth, modPosition.y) * step(lineWidth, modPosition.z);
        gl_FragColor = mix(vec4(color, 1.0), vec4(0.0, 0.0, 0.0, 1.0), mask);
      }
    `,
  });

  return (
    <group ref={groupRef}>
      <mesh
        {...props}
        ref={meshRef}
        scale={clicked ? 1.5 : 1}
        onClick={(event) => setClicked(!clicked)}
        onPointerOver={(event) => setHovered(true)}
        onPointerOut={(event) => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={gridShaderMaterial} />
      </mesh>
      {outline && <primitive object={outline} />}
    </group>
  );
};

export default GleamCube;
