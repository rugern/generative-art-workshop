import React, { useState, ChangeEvent } from "react";
import { randomInt } from "../utils/number";
import Sketch from "react-p5";
import p5Types from "p5";

const width = 800;
const height = 800;

const graphWidth = 50;
const graphHeight = 50;
const rewardOffset = 5;
const xr = width / graphWidth;
const yr = height / graphHeight;

const minPheromones = 1;

const euclideanDistance = (x0: number, y0: number, x1: number, y1: number) => {
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
};

const origin = [Math.floor(graphWidth / 2), Math.floor(graphHeight / 2)];

const rewards = [
  [rewardOffset, rewardOffset],
  [rewardOffset, graphHeight - rewardOffset],
  [graphWidth - rewardOffset, graphHeight - rewardOffset],
  [graphWidth - rewardOffset, rewardOffset],
];

const fillAnts = (ants: Ant[], antCount: number) => {
  ants.splice(0);
  for (let i = 0; i < antCount; i++) {
    ants.push({
      position: origin,
      reward: false,
      color: [randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)],
      history: [origin],
    });
  }
};

const selectEdge = (states: State[], totalScore: number) => {
  const randomScoreMarker = Math.random() * totalScore;
  let sum = 0;
  let i = 0;
  while (i < states.length) {
    sum += states[i].score;
    if (sum > randomScoreMarker) {
      return states[i].position;
    }
    i++;
  }
  return states[states.length - 1].position;
};

const calcHeuristicValue = (x0: number, y0: number) => {
  let bestRewardDistance = 1;
  rewards.forEach((reward) => {
    const [x1, y1] = reward;
    const distance = euclideanDistance(x0, y0, x1, y1);
    if (!bestRewardDistance || distance < bestRewardDistance) {
      bestRewardDistance = distance;
    }
  });
  const originDistance = euclideanDistance(x0, y0, origin[0], origin[1]);
  // Bias towards moving away from the colony. Not optimal but more realistic
  // behaviour than knowing the euclidean distance to the reward
  return originDistance / bestRewardDistance;
};

const evaporatePheromones = (matrix: number[][], evaporation: number) => {
  for (let x = 0; x < graphWidth; x++) {
    for (let y = 0; y < graphHeight; y++) {
      matrix[x][y] = Math.max(minPheromones, (1 - evaporation) * matrix[x][y]);
    }
  }
};

const addPheromones = (
  matrix: number[][],
  ants: Ant[],
  pheromoneDeposit: number
) => {
  ants.forEach((ant) => {
    const toDeposit = pheromoneDeposit / ant.history.length;
    ant.history.forEach(([x0, y0]) => {
      matrix[x0][y0] += toDeposit;
    });
  });
};

const foundTarget = (ant: Ant) => {
  const [x0, y0] = ant.position;
  for (let i = 0; i < rewards.length; i++) {
    const [x1, y1] = rewards[i];
    const distance = euclideanDistance(x0, y0, x1, y1);
    // TODO Hvorfor klarer vi ikke å treffe akkurat?
    if (distance <= 1) {
      return true;
    }
  }
  return false;
};

const alreadyVisited = (history: Position[], x0: number, y0: number) => {
  for (let i = 0; i < history.length; i++) {
    const [x1, y1] = history[i];
    if (x0 === x1 && y0 === y1) {
      return true;
    }
  }
  return false;
};

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
  noiseScale: 10,
  noiseWeight: 400,
  circleSize: 1.5,
  evaporation: 0.5,
  antCount: 30,
  pheromoneDeposit: 2,
  pheromoneScale: 6.429,
  heuristicScale: 4.107,
};

type Position = number[];

interface Ant {
  reward: boolean;
  position: Position;
  color: number[];
  history: Position[];
}

interface State {
  position: Position;
  score: number;
}

const matrix = Array(graphHeight)
  .fill(undefined)
  .map(() => Array(graphWidth).fill(minPheromones));
const ants: Ant[] = [];

export const Aco = () => {
  const [state, setState] = useState(defaultState);

  const setNumberValue =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
      setState({
        ...state,
        [key]: parseInt(event.target.value, 10),
      });

  const moveAnts = (p5: p5Types, matrix: number[][], ants: Ant[]) => {
    for (let i = 0; i < state.antCount; i++) {
      const { reward, position, color, history } = ants[i];
      if (reward) {
        continue;
      }
      const [x0, y0] = position;
      const possibleStates = [];
      let totalScore = 0;
      const xMin = Math.max(0, x0 - 1);
      const xMax = Math.min(graphWidth - 1, x0 + 1);
      const yMin = Math.max(0, y0 - 1);
      const yMax = Math.min(graphHeight - 1, y0 + 1);
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          if (alreadyVisited(history, x, y)) {
            continue;
          }
          const pheromone = matrix[x][y];
          const heuristicValue = calcHeuristicValue(x, y);
          const score =
            Math.pow(pheromone, state.pheromoneScale) *
            Math.pow(heuristicValue, state.heuristicScale);
          possibleStates.push({ position: [x, y], score });
          totalScore += score;
        }
      }
      if (possibleStates.length === 0) {
        possibleStates.push({
          position: [randomInt(xMin, xMax + 1), randomInt(yMin, yMax + 1)],
          score: 1,
        });
        totalScore += 1;
      }

      const nextPosition = selectEdge(possibleStates, totalScore);
      ants[i].position = nextPosition;
      ants[i].history.push(nextPosition);

      const [x1, y1] = nextPosition;
      const [r, g, b] = color;
      p5.stroke(r, g, b);
      p5.line(x0 * xr, y0 * yr, x1 * xr, y1 * yr);

      if (foundTarget(ants[i])) {
        ants[i].reward = !ants[i].reward;
      }
    }
  };

  const drawRewards = (p5: p5Types) => {
    p5.fill("red");
    p5.stroke(0);
    rewards.forEach((reward) => {
      const [x, y] = reward;
      p5.circle(x * xr, y * yr, 5);
    });
  };

  const clearCanvas = (p5: p5Types) => {
    p5.fill(255);
    p5.stroke(0);
    p5.rect(0, 0, width, height);
  };

  const drawPheromones = (p5: p5Types, matrix: number[][]) => {
    let max = 0;
    for (let x = 0; x < graphWidth; x++) {
      for (let y = 0; y < graphHeight; y++) {
        if (matrix[x][y] > max) {
          max = matrix[x][y];
        }
        const alpha = p5.map(matrix[x][y], minPheromones, 5, 0, 255, true);
        p5.noStroke();
        p5.fill(252, 136, 118, alpha);
        p5.circle(x * xr, y * yr, xr);
      }
    }
  };

  const finished = (ants: Ant[]) => {
    return ants.every((ant) => ant.reward);
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.frameRate(100);
    clearCanvas(p5);
    drawRewards(p5);
    fillAnts(ants, state.antCount);
  };

  const draw = (p5: p5Types) => {
    moveAnts(p5, matrix, ants);
    if (finished(ants)) {
      evaporatePheromones(matrix, state.evaporation);
      addPheromones(matrix, ants, state.pheromoneDeposit);
      clearCanvas(p5);
      drawRewards(p5);
      drawPheromones(p5, matrix);
      fillAnts(ants, state.antCount);
    }
  };

  return (
    <div className="canvas-container">
      <Sketch setup={setup} draw={draw} />

      <div className="input-panel">
        <p>Fordamping</p>
        <input
          type="range"
          defaultValue={state.evaporation}
          min={0}
          max={10000}
          step="1"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState({
              ...state,
              evaporation: parseInt(event.target.value, 10) / 1000,
            })
          }
        />

        <p>Feromonmengde</p>
        <input
          type="range"
          defaultValue={state.pheromoneDeposit}
          min={0}
          max={100}
          step="1"
          onChange={setNumberValue("pheromoneDeposit")}
        />

        <p>Feromonvekt</p>
        <input
          type="range"
          defaultValue={state.pheromoneScale}
          min={0}
          max={10000}
          step="1"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState({
              ...state,
              pheromoneScale: parseInt(event.target.value, 10) / 1000,
            })
          }
        />

        <p>Heuristikkvekt</p>
        <input
          type="range"
          defaultValue={state.heuristicScale}
          min={0}
          max={10000}
          step="1"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setState({
              ...state,
              heuristicScale: parseInt(event.target.value, 10) / 1000,
            })
          }
        />
      </div>
    </div>
  );
};
