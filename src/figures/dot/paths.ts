import dotTypes from "../../constants/dotTypes";

// The paths must be in relative commands (lowercased letters) and unminified
const paths: { [key in string]: { path: string; size: number } } = {
  [dotTypes.star]: {
    path: "m 4 0 l 1.24 2.63 l 2.76 0.43 l -2 2.05 l 0.47 2.89 l -2.47 -1.37 l -2.47 1.37 l 0.47 -2.89 l -2 -2.05 l 2.76 -0.43 z",
    size: 8
  },
  [dotTypes.diamond]: {
    path: "m 4 0 l 4 4 l -4 4 l -4 -4 l 4 -4 l 4 4 z",
    size: 8
  },
  [dotTypes.x]: {
    path: "m 8 0 l -3 0 l -1 1 l -1 -1 l -3 0 l 0 3 l 1 1 l -1 1 l 0 3 l 3 0 l 1 -1 l 1 1 l 3 0 l 0 -3 l -1 -1 l 1 -1 z",
    size: 8
  },
  [dotTypes.cross]: {
    path: "m 5.5 2.5 l 0 -2.5 l -3 0 l 0 2.5 l -2.5 0 l 0 3 l 2.5 0 l 0 2.5 l 3 0 l 0 -2.5 l 2.5 0 l 0 -3 z",
    size: 8
  },
  [dotTypes.crossRounded]: {
    path: "m 6.5 2.5 h -1 v -1 c 0 -0.83 -0.67 -1.5 -1.5 -1.5 s -1.5 0.67 -1.5 1.5 v 1 h -1 c -0.83 0 -1.5 0.67 -1.5 1.5 s 0.67 1.5 1.5 1.5 h 1 v 1 c 0 0.83 0.67 1.5 1.5 1.5 s 1.5 -0.67 1.5 -1.5 v -1 h 1 c 0.83 0 1.5 -0.67 1.5 -1.5 s -0.67 -1.5 -1.5 -1.5 z",
    size: 8
  },
  [dotTypes.xRounded]: {
    path: "m 5.88 0 l 0 0 c -0.56 0 -1.1 0.22 -1.5 0.62 l -0.38 0.38 l -0.38 -0.38 c -0.4 -0.4 -0.94 -0.62 -1.5 -0.62 h 0 c -1.17 0 -2.12 0.95 -2.12 2.12 v 0 c 0 0.56 0.22 1.1 0.62 1.5 l 0.38 0.38 l -0.38 0.38 c -0.4 0.4 -0.62 0.94 -0.62 1.5 v 0 c 0 1.17 0.95 2.12 2.12 2.12 h 0 c 0.56 0 1.1 -0.22 1.5 -0.62 l 0.38 -0.38 l 0.38 0.38 c 0.4 0.4 0.94 0.62 1.5 0.62 h 0 c 1.17 0 2.12 -0.95 2.12 -2.12 v 0 c 0 -0.56 -0.22 -1.1 -0.62 -1.5 l -0.38 -0.38 l 0.38 -0.38 c 0.4 -0.4 0.62 -0.94 0.62 -1.5 v 0 c 0 -1.17 -0.95 -2.12 -2.12 -2.12 z",
    size: 8
  },
  [dotTypes.heart]: {
    path: "m 4.01 1.58 c 2 -1.98 3.98 -0.99 3.99 0.98 c 0.01 1.98 -3.99 4.94 -3.99 4.94 s -4.01 -2.96 -4.01 -4.94 s 2 -2.96 4.01 -0.98 z",
    size: 8
  }
};

export default paths;
