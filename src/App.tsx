import React, {useReducer} from "react";
import "./App.css";
import GleamingTheCube from "./containers/GleamingTheCube";
import SurfingTheCity from "./containers/SurfingTheCity";
import SynergyGods from "./containers/SynergyGods";
import TerrainFun from "./containers/TerrainFun";

type AppState = "GLEAMING_THE_CUBE" | "SURFING_THE_CITY" | "TERRAIN_FUN" | "TOO_MUCH_SYNERGY";

const stateMachine: Record<AppState, AppState> = {
  GLEAMING_THE_CUBE: "SURFING_THE_CITY",
  SURFING_THE_CITY: "TERRAIN_FUN",
  TERRAIN_FUN: "TOO_MUCH_SYNERGY",
  TOO_MUCH_SYNERGY: "TOO_MUCH_SYNERGY",
};

type Actions = { type: "NEXT" };

function stateReducer(state: AppState, action: Actions): AppState {
  switch (action.type) {
    case "NEXT":
      return stateMachine[state];
    default:
      return state;
  }
}

function App() {
  // const [state, dispatch] = useReducer(stateReducer, "GLEAMING_THE_CUBE");
  const [state, dispatch] = useReducer(stateReducer, "TERRAIN_FUN");

  const nextState = () => {
    dispatch({type: "NEXT"});
  };

  return (
    <div className="App">
      {state === "GLEAMING_THE_CUBE" && <GleamingTheCube continueToNextDimension={nextState}/>}
      {state === "SURFING_THE_CITY" && <SurfingTheCity continueToNextDimension={nextState}/>}
      {state === "TOO_MUCH_SYNERGY" && <SynergyGods/>}
      {state === "TERRAIN_FUN" && <TerrainFun/>}
    </div>
  );
}

export default App;
