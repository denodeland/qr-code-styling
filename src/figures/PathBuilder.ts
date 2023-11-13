import cornerSquarePaths from "./cornerSquare/paths";
import cornerDotPaths from "./cornerDot/paths";
import dotPaths from "./dot/paths";

type Paths = { [key in string]: { path: string; size: number } };

class PathBuilder {
  cachedPaths: { [key in string]: { [key in number]: string } } = {};
  cachedRelativePaths: { [key in string]: Array<string | number> } = {};
  paths: Paths;

  constructor(paths: Paths) {
    this.paths = paths;
  }

  build({ type, size, x, y }: { type: string; size: number; x: number; y: number }): string {
    const basePath = this.paths[type];
    const cachedPathBySize = (this.cachedPaths[type] = this.cachedPaths[type] || {});

    if (!basePath) {
      return "";
    }

    if (!this.cachedRelativePaths[type]) {
      // build paths using relative sizes
      // e.g. ['m', 0.5, 1] multiplied by the size 24 is 'm 12 24'
      this.cachedRelativePaths[type] = basePath.path.split(" ").map((item) => {
        if (Number.isNaN(Number(item))) {
          return item;
        }
        return Number(item) / basePath.size;
      });
    }

    if (!cachedPathBySize[size]) {
      // build the path for the given size
      cachedPathBySize[size] = this.cachedRelativePaths[type]
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
}

export const cornerSquarePathBuilder = new PathBuilder(cornerSquarePaths);
export const cornerDotPathBuilder = new PathBuilder(cornerDotPaths);
export const dotPathBuilder = new PathBuilder(dotPaths);

export default PathBuilder;
