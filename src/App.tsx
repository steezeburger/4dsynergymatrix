import React, {useEffect, useState} from "react";
import {Canvas} from "@react-three/fiber";
import "./App.css";
import GleamCube, {CubeState} from "./components/GleamCube";

const NUM_ROWS = 10;
const NUM_COLS = 10;
const SPACING = 1.5;

const MAX_SCORE = NUM_ROWS * NUM_COLS;

function App() {
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
      prompt("you've won a $20 sears gift card. please sign the guest book if you win :)");
      // TODO - create a guest book? idk, it doesn't really matter
    }
  }, [score]);


  const cubes = [];
  for (let i = 0; i < NUM_ROWS; i++) {
    for (let j = 0; j < NUM_COLS; j++) {
      let startingState: CubeState = "GREEN";
      if (i === 5 && j === 5) {
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
    <div className="App">
      <div className="clickCount">dimension count: {clickCount}</div>
      <div className="score">synergy score: {score}</div>
      <Canvas>
        <pointLight position={[10, 10, 10]}/>
        {cubes}
      </Canvas>
    </div>
  );
}

export default App;
