import { DotType } from "../../types";
import paths from "./paths";

const cachedPaths: { [key in string]: { [key in number]: string } } = {};
const cachedRelativePaths: { [key in string]: Array<string | number> } = {};

export function buildPath({ type, size, x, y }: { type: DotType; size: number; x: number; y: number }): string {
  const basePath = paths[type];
  const cachedPathBySize = cachedPaths[type] || {};

  if (!cachedRelativePaths[type]) {
    // build paths using relative sizes
    // e.g. ['m', 0.5, 1] multiplied by the size 24 is 'm 12 24'
    cachedRelativePaths[type] = basePath.path.split(" ").map((item) => {
      if (Number.isNaN(Number(item))) {
        return item;
      }
      return Number(item) / basePath.size;
    });
  }

  if (!cachedPathBySize[size]) {
    // build the path for the given size
    cachedPathBySize[size] = cachedRelativePaths[type]
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        // strip decimals after the 3rd digit
        return Math.round(item * size * 1000) / 1000;
      })
      .join(" ");
  }

  return `m ${x} ${y} ${cachedPathBySize[size]}`;
}
