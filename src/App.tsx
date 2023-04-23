import React, {useState} from 'react';
import {Canvas} from "@react-three/fiber";
import './App.css';
import GleamCube, {CubeState} from "./components/GleamCube";

function App() {
  const AppContext = React.createContext({});

  const numRows = 10;
  const numCols = 10;
  const spacing = 1.5;

  // FIXME - it's currently possible to destroy all the cubes and have a score less than 100
  // wait, my thinking is wrong. it's not possible to have a score less than 100.
  // is there a cube off screen? is my math wrong?
  const maxScore = numRows * numCols;

  const [clickCount, setClickCount] = useState(0);
  const [score, setScore] = useState(0);

  const handleCubeClick = (didDestruct: boolean) => {
    setClickCount(clickCount + 1);
    // didDestruct is true when the cube was destroyed.
    // increase the score and check if the game is over.
    if (didDestruct) {
      setScore(score + 1);
      if (score === maxScore) {
        prompt("you've won a $20 sears gift card. please send $20 to sears and i will send you the gift card. please sign the guest book if you win :)");
      }
    }
  };

  const cubes = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
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
            (i - numRows / 2) * spacing,
            (j - numCols / 2) * spacing,
            0
          ]}
        />
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
