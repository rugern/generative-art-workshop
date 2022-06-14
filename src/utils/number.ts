export const randomInt = (min: number, maxExclusive: number) =>
  Math.floor(Math.random() * (maxExclusive - min)) + min;
