import "./SurfingTheCity.css";
import React, {useMemo, useRef} from "react";
import {Canvas, MeshProps, useFrame} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import {Color, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, ShaderMaterial} from "three";

const NUM_BUILDINGS = 300;

type SurfingTheCityProps = {
  continueToNextDimension: () => void;
} & MeshProps;

const SurfingTheCity: React.FC<SurfingTheCityProps> = (props) => {
  const handleClick = (isYellowCube: boolean) => {
    if (isYellowCube) {
      props.continueToNextDimension();
    }
  };

  // generate a bunch of meshes that represent buildings
  // make them all different sizes
  // make one of the cubes yellow
  const randIndex = Math.floor(Math.random() * NUM_BUILDINGS);
  const buildings = [];
  for (let i = 0; i < NUM_BUILDINGS; i++) {
    if (i === randIndex) {
      buildings.push(
        <Building key={i} handleClick={handleClick} colorOverride={0xffff00}/>,
      );
    } else {
      buildings.push(
        <Building key={i} handleClick={handleClick}/>,
      );
    }
  }

  return (
    <div className="SurfingTheCity">
      <div className="instructions">find the yellow cube</div>
      <Canvas>
        {buildings}
        <CameraControls/>
      </Canvas>
    </div>
  );
};

export default SurfingTheCity;

type BuildingProps = {
  handleClick: (isYellowCube: boolean) => void;
  colorOverride?: number;
} & MeshProps;

const Building: React.FC<BuildingProps> = (props) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.getElapsedTime()) * Math.random();
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * Math.random();
      groupRef.current.position.z = Math.sin(state.clock.getElapsedTime()) * Math.random();

      groupRef.current.position.z = Math.sin(state.clock.getElapsedTime()) * 30;
    }
  });

  const outline = useMemo(() => {
    if (meshRef.current) {
      const edgesGeometry = new EdgesGeometry(meshRef.current.geometry);
      const lineMaterial = new LineBasicMaterial({color: "black"});
      return new LineSegments(edgesGeometry, lineMaterial);
    }
  }, [meshRef.current]);

  let color = 0x00ff00;
  if (props.colorOverride) {
    color = props.colorOverride;
  }
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

  const handleClick = () => {
    if (props.colorOverride) {
      props.handleClick(true);
    } else {
      props.handleClick(false);
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        {...props}
        ref={meshRef}
        position={[
          Math.random() * 100 - 50,
          Math.random() * 100 - 50,
          Math.random() * 100 - 50,
        ]}
        scale={[Math.random() * 10, Math.random() * 10, Math.random() * 30]}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]}/>
        <primitive object={gridShaderMaterial}/>
      </mesh>
      {outline && <primitive object={outline}/>}
    </group>
  );
};
