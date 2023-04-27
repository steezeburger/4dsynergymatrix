import React, {useEffect, useRef, useState} from "react";
import {Canvas, MeshProps, useFrame} from "@react-three/fiber";
import {BufferAttribute, BufferGeometry, Color, Material, Mesh, PlaneGeometry, ShaderMaterial} from "three";
import {ImprovedNoise} from "three/examples/jsm/math/ImprovedNoise";
import "./TerrainFun.css";

const gridSize = 100;
const gridSegments = 100;
const noiseScale = 0.08;
const heightScale = 30;

const TerrainFun: React.FC<MeshProps> = (props) => {
  const [noiseScale, setNoiseScale] = useState(0.08);
  const [heightScale, setHeightScale] = useState(30);
  const [gridLineColor, setGridLineColor] = useState(0x00ff00);
  const [gridBackgroundColor, setGridBackgroundColor] = useState(0x000000);

  return (
    <div className="TerrainFun">
      <h1 className="header">Synergy Simulator v53.0.1</h1>
      <div className="controls">
        <div className="control">
          <label htmlFor="noiseScale">noise scale</label>
          <input
            id="noiseScale"
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={noiseScale}
            onChange={e => setNoiseScale(parseFloat(e.target.value))}
          />
        </div>
        <div className="control">
          <label htmlFor="heightScale">height scale</label>
          <input
            id="heightScale"
            type="range"
            min="1"
            max="100"
            step="1"
            value={heightScale}
            onChange={e => setHeightScale(parseFloat(e.target.value))}
          />
        </div>
        <div className="control">
          <label htmlFor="gridLineColor">grid line color</label>
          <input
            id="gridLineColor"
            type="color"
            value={gridLineColor}
            onChange={e => setGridLineColor(parseInt(e.target.value.slice(1), 16))}
          />
        </div>
        <div className="control">
          <label htmlFor="gridBackgroundColor">grid background color</label>
          <input
            id="gridBackgroundColor"
            type="color"
            value={gridBackgroundColor}
            onChange={e => setGridBackgroundColor(parseInt(e.target.value.slice(1), 16))}
          />
        </div>
      </div>

      <div className="lower">
        <Canvas camera={{position: [0, 30, 75], fov: 100}}>
          <Terrain
            noiseScale={noiseScale}
            heightScale={heightScale}
            gridLineColor={gridLineColor}
            gridBackgroundColor={gridBackgroundColor}
          />
        </Canvas>
      </div>

    </div>
  );
};

const generateTerrain = (vertices: Float32Array, time: number, noiseScale: number, heightScale: number) => {
  const perlin = new ImprovedNoise();

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i] * noiseScale;
    const z = vertices[i + 2] * noiseScale;
    const y = perlin.noise(x + time, z + time, 0) * heightScale;

    vertices[i + 1] = y;
  }
};

type TerrainProps = {
  noiseScale: number;
  heightScale: number;
  gridLineColor: number;
  gridBackgroundColor: number;
  // TODO - support gradient
  backgroundColor?: number;
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
  }, []);

  const gridLineColor = new Color(props.gridLineColor);
  const gridBackgroundColor = new Color(props.gridBackgroundColor);
  const neonGridShaderMaterial = new ShaderMaterial({
    uniforms: {
      lineColor: {value: gridLineColor},
      backgroundColor: {value: gridBackgroundColor},
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
      uniform vec3 backgroundColor;
      void main() {
        vec3 color = lineColor;
        vec3 backgroundColor = backgroundColor;
        float lineWidth = 0.05;
        float gridWidth = 0.02;
        vec3 modPosition = mod(vPosition + 0.5, 1.0);
        float mask = step(lineWidth, modPosition.x) * step(lineWidth, modPosition.z);
        gl_FragColor = mix(vec4(color, 1.0), vec4(backgroundColor, 1.0), mask);
      }
    `,
  });

  useFrame((state, delta, frame) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // Rotate the terrain horizontally

      generateTerrain(vertices, state.clock.getElapsedTime(), props.noiseScale, props.heightScale); // Generate new terrain based on elapsed time
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
