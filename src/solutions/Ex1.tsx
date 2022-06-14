import React, { useState, ChangeEvent } from "react";
import { HexColorPicker } from "react-colorful";
import Sketch from "react-p5";
import p5Types from "p5";

const defaultState = {
  circleSize: 40,
  padding: 100,
  backgroundColor: "#7efce5",
  circleColor: "#e57efc",
  rows: 6,
  columns: 6,
};
const width = 800;
const height = 800;

const createRotations = (rows: number, columns: number) => {
  const data: number[][] = [];
  for (let i = 0; i < rows; i++) {
    data[i] = [];
    for (let j = 0; j < columns; j++) {
      const rotation = (Math.floor(Math.random() * 4) * 3.14) / 2;
      data[i].push(rotation);
    }
  }
  return data;
};

export const Ex1 = () => {
  const [state, setState] = useState(defaultState);
  let rotations = createRotations(state.rows, state.columns);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
  };

  const setNumberValue =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
      setState({ ...state, [key]: parseInt(event.target.value, 10) });

  const draw = (p5: p5Types) => {
    p5.fill(state.backgroundColor);
    p5.rect(0, 0, width, height); // Create canvas border

    const drawingWidth = width - state.padding * 2;
    const drawingHeight = height - state.padding * 2;
    const rowSize = drawingHeight / (state.rows - 1);
    const colSize = drawingWidth / (state.columns - 1);

    p5.fill(state.circleColor);
    p5.noStroke();
    for (let i = 0; i < state.rows; i++) {
      for (let j = 0; j < state.columns; j++) {
        p5.arc(
          state.padding + colSize * j,
          state.padding + rowSize * i,
          state.circleSize,
          state.circleSize,
          rotations[i][j],
          rotations[i][j] + (3 * 3.14) / 2
        );
      }
    }
    p5.noFill();
  };

  return (
    <div className="canvas-container">
      <Sketch setup={setup} draw={draw} />

      <div className="input-panel">
        <p>Rader</p>
        <input
          type="range"
          defaultValue={state.rows}
          min={2}
          max={20}
          step="1"
          onChange={setNumberValue("rows")}
        />

        <p>Kolonner</p>
        <input
          type="range"
          defaultValue={state.columns}
          min={2}
          max={20}
          step="1"
          onChange={setNumberValue("columns")}
        />

        <p>Sirkelstørrelse</p>
        <input
          type="range"
          defaultValue={state.circleSize}
          min={5}
          max={200}
          step="1"
          onChange={setNumberValue("circleSize")}
        />

        <p>Padding</p>
        <input
          type="range"
          defaultValue={state.padding}
          min={0}
          max={400}
          step="1"
          onChange={setNumberValue("padding")}
        />

        <p>Bakgrunnsfarge</p>
        <HexColorPicker
          color={state.backgroundColor}
          onChange={(backgroundColor: string) =>
            setState({ ...state, backgroundColor })
          }
        />

        <p>Sirkelfarge</p>
        <HexColorPicker
          color={state.circleColor}
          onChange={(circleColor: string) =>
            setState({ ...state, circleColor })
          }
        />
      </div>
    </div>
  );
};
