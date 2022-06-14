import React, { useState, ChangeEvent } from "react";
import Sketch from "react-p5";
import p5Types from "p5";

const width = 800;
const height = 800;

const defaultState = {
  size: 40,
};

export const Example = () => {
  const [state, setState] = useState(defaultState);

  const setNumberValue =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
      setState({ ...state, [key]: parseInt(event.target.value, 10) });

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.rect(0, 0, width, height); // Create canvas border
  };

  const draw = (p5: p5Types) => {
    p5.circle(400, 400, state.size);
  };

  return (
    <div className="canvas-container">
      <Sketch setup={setup} draw={draw} />

      <div className="input-panel">
        <p>Circle size</p>
        <input
          type="range"
          defaultValue={state.size}
          min={1}
          max={100}
          step="1"
          onChange={setNumberValue("size")}
        />
      </div>
    </div>
  );
};
