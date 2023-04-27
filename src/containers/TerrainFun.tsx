import React, {useEffect, useRef, useState} from "react";
import {Canvas, MeshProps, useFrame} from "@react-three/fiber";
import {BufferAttribute, BufferGeometry, Material, Mesh, PlaneGeometry, ShaderMaterial} from "three";
import {ImprovedNoise} from "three/examples/jsm/math/ImprovedNoise";
import "./TerrainFun.css";

const gridSize = 100;
const gridSegments = 100;
const noiseScale = 0.08;
const heightScale = 30;

const TerrainFun: React.FC<MeshProps> = (props) => {
  return (
    <div className="TerrainFun">
      <Canvas camera={{position: [0, 30, 75], fov: 100}}>
        <Terrain/>
      </Canvas>
    </div>
  );
};

const generateTerrain = (vertices: Float32Array, time: number) => {
  const perlin = new ImprovedNoise();

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i] * noiseScale;
    const z = vertices[i + 2] * noiseScale;
    const y = perlin.noise(x + time, z + time, 0) * heightScale;

    vertices[i + 1] = y;
  }
};

type TerrainProps = {
  noiseScale?: number;
  heightScale?: number;
  gridLineColor?: string;
  gridBackgroundColor?: string;
  backgroundColor?: string;
} & MeshProps;

const Terrain: React.FC<TerrainProps> = (props) => {
  const meshRef = useRef<Mesh<BufferGeometry, Material | Material[]> | null>(null);

  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [vertices, setVertices] = useState<Float32Array>(new Float32Array(0));
  const [positionAttribute, setPositionAttribute] = useState<BufferAttribute | null>(null);

  useEffect(() => {
    const geometry = new PlaneGeometry(gridSize, gridSize, gridSegments, gridSegments);
    geometry.rotateX(-Math.PI / 2);

    if (geometry) {
      const positionAttribute = geometry.attributes.position as BufferAttribute;
      const originalVertices = positionAttribute.array;
      const vertices = new Float32Array(originalVertices.length);
      const perlin = new ImprovedNoise();

      for (let i = 0; i < originalVertices.length; i += 3) {
        const x = originalVertices[i] * noiseScale;
        const z = originalVertices[i + 2] * noiseScale;
        const y = perlin.noise(x, z, 0) * heightScale;

        vertices[i] = originalVertices[i];
        vertices[i + 1] = y;
        vertices[i + 2] = originalVertices[i + 2];
        setVertices(vertices);
      }

      positionAttribute.array = vertices;
      positionAttribute.needsUpdate = true;
      setPositionAttribute(positionAttribute);
      setGeometry(geometry);
    }
  });

  const neonGridShaderMaterial = new ShaderMaterial({
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
        float lineWidth = 0.05;
        float gridWidth = 0.02;
        vec3 modPosition = mod(vPosition + 0.5, 1.0);
        float mask = step(lineWidth, modPosition.x) * step(lineWidth, modPosition.z);
        gl_FragColor = mix(vec4(color, 1.0), vec4(0.0, 0.0, 0.0, 1.0), mask);
      }
    `,
  });

  useFrame((state, delta, frame) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // Rotate the terrain horizontally

      generateTerrain(vertices, state.clock.getElapsedTime()); // Generate new terrain based on elapsed time
      if (positionAttribute) {
        positionAttribute.array = vertices;
        positionAttribute.needsUpdate = true;
      }
    }
  });

  return (
    <mesh ref={meshRef} {...props}>
      {geometry && <primitive object={geometry}/>}
      <primitive object={neonGridShaderMaterial}/>
    </mesh>
  );
};

export default TerrainFun;
