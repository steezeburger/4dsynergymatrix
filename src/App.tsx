import React, {useEffect, useReducer} from "react";
import "./App.css";
import GleamingTheCube from "./containers/GleamingTheCube";

type AppState = "GLEAMING_THE_CUBE" | "SURFING_THE_CITY";

const stateMachine: Record<AppState, AppState> = {
  GLEAMING_THE_CUBE: "SURFING_THE_CITY",
  SURFING_THE_CITY: "GLEAMING_THE_CUBE",
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
  const [state, dispatch] = useReducer(stateReducer, "GLEAMING_THE_CUBE");

  const nextState = () => {
    dispatch({type: "NEXT"});
  };

  return (
    <div className="App">
      {state === "GLEAMING_THE_CUBE" && <GleamingTheCube continueToNextDimension={nextState}/>}
      {state === "SURFING_THE_CITY" && <div>YOOOO</div>}
    </div>
  );
}

export default App;
