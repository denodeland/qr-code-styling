import cornerDotTypes from "../../constants/cornerDotTypes";
// patch to import statically the path on build:node
import square3Path from "./square3Path.static";

type Path = { path: string; size: number };

// The paths must be in relative commands (lowercased letters)
const paths: { [key in string]: { path: string; size: number } } = {
  [cornerDotTypes.rounded]: {
    path: "m10 14h-6c-2.21 0-4-1.79-4-4v-6c0-2.21 1.79-4 4-4h6c2.21 0 4 1.79 4 4v6c0 2.21-1.79 4-4 4z",
    size: 14
  },
  [cornerDotTypes.square2]: {
    path: "m15 15-13.9 0-1.1-15 15 1.1z",
    size: 15
  },
  [cornerDotTypes.dot2]: {
    path: "m7 14 0 0c-3.87 0-7-3.13-7-7v-7h7c3.87 0 7 3.13 7 7v0c0 3.87-3.13 7-7 7z",
    size: 14
  },
  [cornerDotTypes.dot3]: {
    path: "m7 0 0 0c3.87 0 7 3.13 7 7v7h-7c-3.87 0-7-3.13-7-7v0c0-3.87 3.13-7 7-7z",
    size: 14
  },
  [cornerDotTypes.dot4]: {
    path: "m0 0h7c3.87 0 7 3.13 7 7v7h-7c-3.87 0-7-3.13-7-7v-7z",
    size: 14
  },
  [cornerDotTypes.sun]: {
    path: "m7.8 1.4 1.38-1.05.49 1.66 1.65-.52-.11 1.74 1.73.07-.69 1.59 1.6.67-1.2 1.26 1.28 1.17-1.56.77.8 1.54-1.72.19.22 1.72-1.68-.41-.38 1.7-1.45-.97-.93 1.47-1.03-1.4-1.38 1.05-.49-1.66-1.65.52.11-1.74-1.73-.07.69-1.59-1.6-.67 1.2-1.26-1.28-1.17 1.56-.77-.8-1.54 1.72-.19-.22-1.72 1.68.41.38-1.7 1.45.97.93-1.47z",
    size: 14
  },
  [cornerDotTypes.star]: {
    path: "m7.28 11.95 3.23 1.49c.47.22 1.01-.17.94-.69l-.42-3.53c-.02-.19.04-.39.17-.53l2.41-2.61c.35-.38.15-1.01-.36-1.11l-3.49-.7c-.19-.04-.36-.16-.45-.33l-1.74-3.1c-.26-.46-.91-.46-1.17 0l-1.74 3.1c-.1.17-.26.29-.45.33l-3.49.7c-.51.1-.71.73-.36 1.11l2.41 2.61c.13.14.2.34.17.53l-.42 3.53c-.06.52.47.9.94.69l3.23-1.49c.21-.08.41-.08.59 0z",
    size: 14
  },
  [cornerDotTypes.diamond]: {
    path: "m4 0 4 4-4 4-4-4 4-4 4 4z",
    size: 8
  },
  [cornerDotTypes.x]: {
    path: "m8 0-3 0-1 1-1-1-3 0 0 3 1 1-1 1 0 3 3 0 1-1 1 1 3 0 0-3-1-1 1-1z",
    size: 8
  },
  [cornerDotTypes.xRounded]: {
    path: "m10.29 0 0 0c-.98 0-1.93.39-2.63 1.09l-.66.66-.66-.66c-.7-.7-1.64-1.09-2.63-1.09h0c-2.05 0-3.71 1.66-3.71 3.71v0c0 .98.39 1.93 1.09 2.62l.66.67-.66.66c-.7.7-1.09 1.64-1.09 2.63v0c0 2.05 1.66 3.71 3.71 3.71h0c.98 0 1.93-.39 2.62-1.09l.67-.66.66.66c.7.7 1.64 1.09 2.62 1.09h0c2.05 0 3.71-1.66 3.71-3.71v0c0-.98-.39-1.93-1.09-2.62l-.65-.67.66-.66c.7-.7 1.09-1.64 1.09-2.63v0c0-2.05-1.66-3.71-3.71-3.71z",
    size: 14
  },
  [cornerDotTypes.cross]: {
    path: "m10.5 3.5 0-3.5-7 0 0 3.5-3.5 0 0 7 3.5 0 0 3.5 7 0 0-3.5 3.5 0 0-7z",
    size: 14
  },
  [cornerDotTypes.crossRounded]: {
    path: "m10.5 3.5 0 0c0-1.93-1.57-3.5-3.5-3.5h0c-1.93 0-3.5 1.57-3.5 3.5v0h0c-1.93 0-3.5 1.57-3.5 3.5v0c0 1.93 1.57 3.5 3.5 3.5h0v0c0 1.93 1.57 3.5 3.5 3.5h0c1.93 0 3.5-1.57 3.5-3.5v0h0c1.93 0 3.5-1.57 3.5-3.5v0c0-1.93-1.57-3.5-3.5-3.5l0 0z",
    size: 14
  },
  [cornerDotTypes.heart]: {
    path: "m7.01 2.89c3.5-3.46 6.97-1.73 6.99 1.72.01 2.83-4.65 6.81-6.37 8.17-.37.29-.88.29-1.25 0-1.71-1.36-6.38-5.34-6.38-8.16 0-3.46 3.5-5.19 7.01-1.73z",
    size: 14
  }
};

export const lazyPaths = {
  [cornerDotTypes.square3]: (): Promise<{ default: Path }> =>
    square3Path ? Promise.resolve({ default: square3Path as Path }) : import("./square3Path")
};

export default paths;
