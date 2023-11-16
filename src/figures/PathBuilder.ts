import cornerSquarePaths, { lazyPaths as cornerSquareLazyPaths } from "./cornerSquare/paths";
import cornerDotPaths, { lazyPaths as cornerDotLazyPaths } from "./cornerDot/paths";
import SvgParser from "./SvgParser";
import dotPaths from "./dot/paths";

type Path = { path: string; size: number };
type Paths = { [key in string]: Path };
type LazyPath = Promise<{ default: Path }>;
class PathBuilder {
  cachedPaths: { [key in string]: { [key in number]: string } } = {};
  cachedRelativePaths: { [key in string]: Array<string | number> } = {};
  paths: Paths;
  lazyPaths: { [key in string]: () => LazyPath };

  constructor(paths: Paths, lazyPaths = {}) {
    this.paths = paths;
    this.lazyPaths = lazyPaths;
  }

  async loadPath(type: string | undefined): Promise<void> {
    if (!type || !this.lazyPaths[type] || this.paths[type]) {
      return;
    }

    const response = await this.lazyPaths[type]();
    this.paths[type] = response.default;
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
      this.cachedRelativePaths[type] = SvgParser.parse(basePath.path, basePath.size);
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

export const cornerSquarePathBuilder = new PathBuilder(cornerSquarePaths, cornerSquareLazyPaths);
export const cornerDotPathBuilder = new PathBuilder(cornerDotPaths, cornerDotLazyPaths);
export const dotPathBuilder = new PathBuilder(dotPaths);

export default PathBuilder;
