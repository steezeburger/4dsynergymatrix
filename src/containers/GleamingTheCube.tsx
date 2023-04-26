import React, {useEffect, useState} from "react";
import {Canvas, MeshProps} from "@react-three/fiber";
import "./GleamingTheCube.css";
import GleamCube, {CubeState} from "../components/GleamCube";

const NUM_ROWS = 3;
const NUM_COLS = 3;
const SPACING = 1.5;

const MAX_SCORE = NUM_ROWS * NUM_COLS;

type GleamingTheCubeProps = {
  continueToNextDimension: () => void;
} & MeshProps;

const GleamingTheCube: React.FC<GleamingTheCubeProps> = (props) => {
  const [clickCount, setClickCount] = useState(0);
  const [score, setScore] = useState(0);

  const handleCubeClick = (didDestruct: boolean) => {
    setClickCount(clickCount + 1);
    if (didDestruct) {
      setScore(score => score + 1);
    }
  };

  useEffect(() => {
    if (score === MAX_SCORE) {
      props.continueToNextDimension();
    }
  }, [score]);

  const cubes = [];
  for (let i = 0; i < NUM_ROWS; i++) {
    for (let j = 0; j < NUM_COLS; j++) {
      let startingState: CubeState = "GREEN";
      if (i === 1 && j === 1) {
        startingState = "RED";
      }
      cubes.push(
        <GleamCube
          key={`${i}-${j}`}
          handleCubeClick={handleCubeClick}
          wireframe={false}
          startingState={startingState}
          position_ij={[i, j]}
          position={[
            (i - NUM_ROWS / 2) * SPACING,
            (j - NUM_COLS / 2) * SPACING,
            0,
          ]}
        />,
      );
    }
  }

  return (
    <div className="GleamingTheCube">
      <div className="clickCount">dimension count: {clickCount}</div>
      <div className="score">synergy score: {score}</div>
      <Canvas>
        <pointLight position={[10, 10, 10]}/>
        {cubes}
      </Canvas>
    </div>
  );
};

export default GleamingTheCube;
