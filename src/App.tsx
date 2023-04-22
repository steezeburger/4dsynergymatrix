import React from 'react';
import {Canvas} from "@react-three/fiber";
import './App.css';
import GleamCube from "./components/GleamCube";

function App() {
  const AppContext = React.createContext({});

  const numRows = 53;
  const numCols = 53;
  const spacing = 1.5;

  const cubes = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      let color = 0x00ff00
      if (i === 26 && j === 26) {
        color = 0xff0000
      }
      cubes.push(
        <GleamCube
          key={`${i}-${j}`}
          wireframe={false}
          color={color}
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
      <Canvas>
        <pointLight position={[10, 10, 10]}/>
        {cubes}
      </Canvas>
    </div>
  );
}

export default App;
