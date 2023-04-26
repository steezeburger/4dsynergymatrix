import React, {useEffect, useMemo, useReducer, useRef} from "react";
import {MeshProps, useFrame} from "@react-three/fiber";
import {Color, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, ShaderMaterial} from "three";

type GleamCubeProps = {
  wireframe?: boolean;
  position: [number, number, number];
  position_ij: [number, number];
  startingState?: CubeState;
  handleCubeClick: (didDestruct: boolean) => void;
} & MeshProps;

const COLORS = {
  "RED": 0xff0000,
  "GREEN": 0x00ff00,
  "PURPLE": 0xDA70D6,
  "DESTROYED": 0x000000,
};

export type CubeState = "GREEN" | "RED" | "PURPLE" | "DESTROYED";

const stateMachine: Record<CubeState, CubeState> = {
  GREEN: "RED",
  RED: "PURPLE",
  PURPLE: "DESTROYED",
  DESTROYED: "DESTROYED",
};

type Actions = { type: "NEXT" };

function stateReducer(state: CubeState, action: Actions): CubeState {
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

  const firstState: CubeState = props.startingState || "GREEN";
  const [state, dispatch] = useReducer(stateReducer, firstState);
  const [shouldSpin, setShouldSpin] = React.useState(false);
  const handleClick = () => {
    dispatch({type: "NEXT"});
    const didDestruct = state === "PURPLE";
    props.handleCubeClick(didDestruct);
  };

  useEffect(() => {
    if (props.startingState === "RED") {
      if (meshRef.current) {
        meshRef.current.rotation.x += 500;
      }
    }
    if (state === "PURPLE") {
      setShouldSpin(true);
    }
  }, [state, props.startingState, groupRef.current]);


  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.005;
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.z += 0.005;
    }
    if (shouldSpin) {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.z += 0.01;
      }
    }
  });

  const outline = useMemo(() => {
    if (meshRef.current) {
      const edgesGeometry = new EdgesGeometry(meshRef.current.geometry);
      const lineMaterial = new LineBasicMaterial({color: "black"});
      return new LineSegments(edgesGeometry, lineMaterial);
    }
  }, [meshRef.current]);

  const color = COLORS[state];
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

    float smoothEdge(float value, float threshold, float range) {
      return smoothstep(threshold - range, threshold + range, value);
    }

    void main() {
      vec3 color = lineColor;
      float lineWidth = 0.05;
      float gridSize = 10.0;
      float glowRange = 0.08;
      vec3 modPosition = mod(vPosition * gridSize + 0.5, 1.0);
      float edgeDistance = min(min(modPosition.x, modPosition.y), modPosition.z);
      float mask = smoothEdge(edgeDistance, lineWidth, glowRange);
      gl_FragColor = mix(vec4(color, 1.0), vec4(0.0, 0.0, 0.0, 1.0), mask);
    }
  `,
  });

  if (state === "DESTROYED") {
    return <></>;
  }

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
