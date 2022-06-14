import React, { useState, ChangeEvent } from "react";
import { RgbColorPicker } from "react-colorful";
import p5Types from "p5";
import Sketch from "react-p5";

const defaultState = {
  width: 190,
  height: 75,
  color1: { r: 5, g: 210, b: 255 },
  color2: { r: 23, g: 104, b: 149 },
  alpha: 255,
  strokeWeight: 5,
  keepCanvas: false,
  shapes: 18,
  redraw: true,
};
const width = 1200;
const height = 600;

const averageYValue = (shape: number[][]) => (shape[1][1] + shape[0][1]) / 2;

const randomInt = (maxExclusive: number) =>
  Math.floor(Math.random() * maxExclusive);

const generateAllPoints = () => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      points.push([i, j]);
    }
  }
  return points;
};

export const Ex2 = () => {
  const [state, setState] = useState(defaultState);

  const setNumberValue =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
      setState({
        ...state,
        [key]: parseInt(event.target.value, 10),
        redraw: true,
      });

  const resetCanvas = (p5: p5Types) => {
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.fill(255);
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

    if (!state.keepCanvas) {
      resetCanvas(p5);
    }

    const colors = [state.color1, state.color2];
    const xPadding = (width - 5 * state.width) / 2;
    const yPadding = (height - 5 * state.height) / 2;

    const sizedVertice = (x: number, y: number) =>
      p5.vertex(x * state.width + xPadding, y * state.height + yPadding);

    // Assign points (in a matrix) on canvas to shapes
    const points = generateAllPoints();
    const shapes = [];
    for (let i = 0; i < state.shapes; i++) {
      const first = points.splice(randomInt(points.length), 1)[0];
      const second = points.splice(randomInt(points.length), 1)[0];
      shapes.push([first, second]);
    }

    p5.stroke("white");
    p5.strokeWeight(state.strokeWeight);

    // Draw shortest shapes in foreground
    shapes.sort((a, b) => averageYValue(a) - averageYValue(b));

    shapes.forEach((shape) => {
      const color = colors[randomInt(2)];
      p5.fill(color.r, color.g, color.b, state.alpha);
      p5.beginShape();
      sizedVertice(shape[0][0], shape[0][1]);
      sizedVertice(shape[1][0], shape[1][1]);
      sizedVertice(shape[1][0], 5);
      sizedVertice(shape[0][0], 5);
      p5.endShape(p5.CLOSE);
      p5.noFill();
    });
  };

  return (
    <div className="canvas-container">
      <Sketch setup={setup} draw={draw} />

      <div className="input-panel">
        <p>Figurhøyde</p>
        <input
          type="range"
          defaultValue={state.height}
          min={20}
          max={150}
          step="1"
          onChange={setNumberValue("height")}
        />

        <p>Figurbredde</p>
        <input
          type="range"
          defaultValue={state.width}
          min={20}
          max={300}
          step="1"
          onChange={setNumberValue("width")}
        />

        <p>Tykkelse hvit linje</p>
        <input
          type="range"
          defaultValue={state.strokeWeight}
          min={1}
          max={20}
          step="1"
          onChange={setNumberValue("strokeWeight")}
        />

        <p>Alpha</p>
        <input
          type="range"
          defaultValue={state.alpha}
          min={1}
          max={255}
          step="1"
          onChange={setNumberValue("alpha")}
        />

        <p>Antall figurer</p>
        <input
          type="range"
          defaultValue={state.shapes}
          min={1}
          max={18}
          step="1"
          onChange={setNumberValue("shapes")}
        />

        <p>Beholde canvas</p>
        <input
          type="checkbox"
          checked={state.keepCanvas}
          onChange={(evt) => {
            setState({
              ...state,
              keepCanvas: evt.target.checked,
              redraw: true,
            });
          }}
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
      </div>
    </div>
  );
};
