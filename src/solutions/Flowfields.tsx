import React, { useState, ChangeEvent } from "react";
import { RgbColorPicker } from "react-colorful";
import { randomInt } from "../utils/number";
import p5Types from "p5";
import Sketch from "react-p5";

const width = 800;
const height = 800;
const boxScale = 0.5;
const xDiff = 2;
const figureWidth = width * boxScale * xDiff;
const figureHeight = height * boxScale * xDiff;
const overlap = 300;
const x0_0 = width / 2 - figureWidth / xDiff + overlap;
const y0_0 = height / 2 - figureHeight / xDiff + overlap;
const x0_1 = width / 2 - overlap;
const y0_1 = height / 2 - overlap;
const stepLength = 1;

interface Color {
  r: number;
  g: number;
  b: number;
}

const defaultState = {
  color1: {
    r: 30,
    g: 164,
    b: 194,
  },
  color2: {
    r: 221,
    g: 86,
    b: 56,
  },
  color3: {
    r: 255,
    g: 228,
    b: 200,
  },
  alpha: 255,
  shapes: 1490,
  steps: 310,
  distance: 7,
  noiseScale: 0.0001,
  noiseWeight: 0.4,
  circleSize: 1.5,
  redraw: true,
};

export const Flowfields = () => {
  const [state, setState] = useState(defaultState);

  const setNumberValue =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
      setState({
        ...state,
        [key]: parseInt(event.target.value, 10),
        redraw: true,
      });

  /**
   * For debugging angle matrix
   */
  const drawAngles = (p5: p5Types) => {
    const space = 9;
    const length = 7;

    const angles = createAngleMatrix(p5);

    for (let i = 0; i < figureWidth; i++) {
      for (let j = 0; j < figureHeight; j++) {
        const angle = angles[i][j];
        const x0 = i * space;
        const y0 = j * space;
        const x1 = x0 + length * p5.cos(angle);
        const y1 = y0 + length * p5.sin(angle);
        p5.line(x0, y0, x1, y1);
      }
    }
  };

  const drawLineFigure = (
    p5: p5Types,
    x0: number,
    y0: number,
    color: Color,
    alpha: number
  ) => {
    p5.stroke(color.r, color.g, color.b, alpha);
    p5.strokeWeight(state.circleSize);
    const angles = createAngleMatrix(p5);
    const lineMatrix = createLineMatrix(p5, angles);
    for (let i = 0; i < figureWidth; i++) {
      for (let j = 0; j < figureHeight; j++) {
        if (lineMatrix[i][j] !== 0) {
          p5.point(x0 + i / xDiff, y0 + j / xDiff);
        }
      }
    }
  };

  const createLineMatrix = (p5: p5Types, angles: number[][]) => {
    const matrix = Array(figureWidth)
      .fill(undefined)
      .map(() => Array(figureHeight).fill(0));

    for (let id = 0; id < state.shapes; id++) {
      let x = randomInt(0, figureWidth);
      let y = randomInt(0, figureHeight);
      let row = x;
      let col = y;
      let count = 0;
      while (validCoordinate(matrix, row, col, id) && count < state.steps) {
        matrix[row][col] = id;
        const angle = angles[row][col];
        x = x + stepLength * p5.cos(angle);
        y = y + stepLength * p5.sin(angle);
        row = Math.round(x);
        col = Math.round(y);
        count++;
      }
    }
    return matrix;
  };

  const createAngleMatrix = (p5: p5Types) => {
    p5.noiseSeed(randomInt(0, 1000));
    const matrix: number[][] = [];
    for (let i = 0; i < figureWidth; i++) {
      matrix[i] = [];
      for (let j = 0; j < figureHeight; j++) {
        matrix[i][j] = createAngle(p5, i, j);
      }
    }
    return matrix;
  };

  const createAngle = (p5: p5Types, x: number, y: number) => {
    return (
      p5.noise(x * state.noiseScale, y * state.noiseScale) * state.noiseWeight
    );
  };

  const validCoordinate = (
    matrix: number[][],
    x: number,
    y: number,
    id: number
  ) => {
    if (x < 0 || x >= figureWidth || y < 0 || y >= figureHeight) {
      return false;
    }
    const xMin = Math.max(x - state.distance, 0);
    const xMax = Math.min(x + state.distance, matrix.length);
    const yMin = Math.max(y - state.distance, 0);
    const yMax = Math.min(y + state.distance, matrix[0].length);

    // Code for checking all neighbouring cells. Seems to work just checking the edges though
    // for (let i = xMin; i < xMax; i++) {
    //   for (let j = yMin; j < yMax; j++) {
    //     const value = matrix[i][j];
    //     if (value !== 0 && value !== id) {
    //       return false;
    //     }
    //   }
    // }

    for (let i = xMin; i < xMax; i++) {
      const val1 = matrix[i][yMin];
      const val2 = matrix[i][yMax - 1];
      if ((val1 !== 0 && val1 !== id) || (val2 !== 0 && val2 !== id)) {
        return false;
      }
    }
    for (let i = yMin; i < yMax; i++) {
      const val1 = matrix[xMin][i];
      const val2 = matrix[xMax - 1][i];
      if ((val1 !== 0 && val1 !== id) || (val2 !== 0 && val2 !== id)) {
        return false;
      }
    }
    return true;
  };

  const resetCanvas = (p5: p5Types) => {
    const { r, g, b } = state.color3;
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.fill(r, g, b);
    p5.rect(0, 0, width, height); // Create canvas border
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    resetCanvas(p5);
  };

  const draw = (p5: p5Types) => {
    if (!state.redraw) {
      return;
    }
    setState({ ...state, redraw: false });
    resetCanvas(p5);

    // drawAngles(angles);
    drawLineFigure(p5, x0_0, y0_0, state.color1, state.alpha);
    drawLineFigure(p5, x0_1, y0_1, state.color2, state.alpha);
  };

  return (
    <div className="canvas-container">
      <Sketch setup={setup} draw={draw} />

      <div className="input-panel">
        <p>Tykkelse</p>
        <input
          type="range"
          defaultValue={state.circleSize}
          min={1}
          max={10}
          step="1"
          onChange={setNumberValue("circleSize")}
        />

        <p>Steg</p>
        <input
          type="range"
          defaultValue={state.steps}
          min={10}
          max={1000}
          step="100"
          onChange={setNumberValue("steps")}
        />

        <p>Distanse</p>
        <input
          type="range"
          defaultValue={state.distance}
          min={1}
          max={20}
          step="1"
          onChange={setNumberValue("distance")}
        />

        <p>Støy for randomgenerator</p>
        <input
          type="range"
          defaultValue={state.noiseScale}
          min={0}
          max={50}
          step="1"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState({
              ...state,
              noiseScale: parseInt(event.target.value, 10) / 1000,
              redraw: true,
            })
          }
        />

        <p>Vekt for randomgenerator</p>
        <input
          type="range"
          defaultValue={state.noiseWeight}
          min={0}
          max={1256}
          step="8"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState({
              ...state,
              noiseWeight: parseInt(event.target.value, 10) / 100,
              redraw: true,
            })
          }
        />

        <p>Antall linjer</p>
        <input
          type="range"
          defaultValue={state.shapes}
          min={10}
          max={2000}
          step="10"
          onChange={setNumberValue("shapes")}
        />

        <p>Alpha</p>
        <input
          type="range"
          defaultValue={state.alpha}
          min={0}
          max={255}
          step="5"
          onChange={setNumberValue("alpha")}
        />

        <p>Farge 1</p>
        <RgbColorPicker
          color={state.color1}
          onChange={(color1) => setState({ ...state, color1, redraw: true })}
        />

        <p>Farge 2</p>
        <RgbColorPicker
          color={state.color2}
          onChange={(color2) => setState({ ...state, color2, redraw: true })}
        />

        <p>Bakgrunn</p>
        <RgbColorPicker
          color={state.color3}
          onChange={(color3) => setState({ ...state, color3, redraw: true })}
        />
      </div>
    </div>
  );
};
