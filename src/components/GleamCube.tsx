import React, {useEffect, useMemo, useReducer, useRef, useState} from "react";
import {MeshProps, useFrame} from "@react-three/fiber";
import {
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial
} from "three";

type GleamCubeProps = {
  wireframe?: boolean;
  position: [number, number, number];
  position_ij: [number, number];
  color: number;
} & MeshProps;

const COLORS = {
  "RED": 0xff0000,
  "GREEN": 0x00ff00,
  "PURPLE": 0xDA70D6,
}

type State = "GREEN" | "RED" | "PURPLE";

const stateMachine: Record<State, State> = {
  GREEN: "RED",
  RED: "PURPLE",
  PURPLE: "GREEN",
};

function stateReducer(state: State, action: { type: "NEXT" }): State {
  switch (action.type) {
    case "NEXT":
      return stateMachine[state];
    default:
      return state;
  }
}

const GleamCube: React.FC<GleamCubeProps> = (props) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  const firstState = props.color === 0xff0000 ? "RED" : "GREEN";
  const [state, dispatch] = useReducer(stateReducer, firstState);
  const handleClick = () => {
    dispatch({ type: "NEXT" });
  }

  const color = COLORS[state];
  if (state === "RED") {
    if (groupRef.current) {
      groupRef.current.rotation.x += 500;
    }
  }
  if (state === "PURPLE") {
    if (groupRef.current) {
      groupRef.current.rotation.y += 500;
    }
  }

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
      const lineMaterial = new LineBasicMaterial({color: "black"});
      return new LineSegments(edgesGeometry, lineMaterial);
    }
  }, [meshRef.current]);

  const lineColor = new Color(color);

  const gridShaderMaterial = new ShaderMaterial({
    uniforms: {
      lineColor: {value: lineColor},
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      uniform vec3 lineColor;
      void main() {
        vec3 color = lineColor;
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
        scale={1}
        onClick={handleClick}
        // onPointerOver={(event) => setHovered(true)}
        // onPointerOut={(event) => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]}/>
        <primitive object={gridShaderMaterial}/>
      </mesh>
      {outline && <primitive object={outline}/>}
    </group>
  );
};

export default GleamCube;
