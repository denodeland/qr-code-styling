import dotTypes from "../../constants/dotTypes";
import { DotType } from "../../types";

export type GetNeighbor = (x: number, y: number) => boolean;

export type DrawArgs = {
  x: number;
  y: number;
  xIndex: number;
  yIndex: number;
  size: number;
  cornerIndex: number;
  getNeighbor: GetNeighbor;
};

export type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation: number;
};

export type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  draw: () => void;
};

export type RotateRectangleArgs = {
  x: number;
  y: number;
  xSize: number;
  ySize: number;
  rotation: number;
  draw: () => void;
};

export default abstract class QRDotBase {
  abstract _type: DotType;

  abstract _basicRectangle(args: { x: number; y: number; xSize: number; ySize: number }): void;

  abstract _basicCornersRounded(args: BasicFigureDrawArgs): void;

  abstract _basicCornerExtraRounded(args: BasicFigureDrawArgs): void;

  abstract _basicSquare(args: BasicFigureDrawArgs): void;

  abstract _basicReducedSquare(args: BasicFigureDrawArgs, baseSize: number): void;

  abstract _basicDot(args: BasicFigureDrawArgs): void;

  abstract _basicDiamond(args: BasicFigureDrawArgs): void;

  abstract _basicCornerRounded(args: BasicFigureDrawArgs): void;

  abstract _basicCornerRibbon(args: BasicFigureDrawArgs): void;

  abstract _basicSideDiamond(args: BasicFigureDrawArgs): void;

  abstract _basicCornerDiamond(args: BasicFigureDrawArgs): void;

  abstract _basicSideRounded(args: BasicFigureDrawArgs): void;

  abstract _reducedBasicSideRounded(args: BasicFigureDrawArgs, baseSize: number): void;

  abstract _basicReducedDot(args: BasicFigureDrawArgs, baseSize: number): void;

  abstract _drawPath({ x, y, size }: DrawArgs): void;

  draw({
    x,
    y,
    xIndex,
    yIndex,
    size,
    getNeighbor,
    cornerIndex = 0
  }: {
    x: number;
    xIndex: number;
    yIndex: number;
    y: number;
    size: number;
    getNeighbor: GetNeighbor;
    cornerIndex?: number;
  }): void {
    const type = this._type;
    let drawFunction;

    switch (type) {
      case dotTypes.dots:
        drawFunction = this._drawDot;
        break;
      case dotTypes.classy:
        drawFunction = this._drawClassy;
        break;
      case dotTypes.classyRounded:
        drawFunction = this._drawClassyRounded;
        break;
      case dotTypes.rounded:
        drawFunction = this._drawRounded;
        break;
      case dotTypes.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case dotTypes.horizontalRounded:
        drawFunction = this._drawHorizontalRounded;
        break;
      case dotTypes.verticalRounded:
        drawFunction = this._drawVerticalRounded;
        break;
      case dotTypes.ribbon:
        drawFunction = this._drawRibbon;
        break;
      case dotTypes.diamondSpecial:
        drawFunction = this._drawDiamondSpecial;
        break;
      case dotTypes.shake:
        drawFunction = this._drawShake;
        break;
      case dotTypes.star:
      case dotTypes.diamond:
      case dotTypes.x:
      case dotTypes.cross:
      case dotTypes.crossRounded:
      case dotTypes.xRounded:
      case dotTypes.heart:
      case dotTypes.sparkle:
        drawFunction = this._drawPath;
        break;
      case dotTypes.square:
      default:
        drawFunction = this._drawSquare;
    }

    drawFunction.call(this, { x, y, xIndex, yIndex, size, getNeighbor, cornerIndex });
  }

  _getNeighbors(getNeighbor: GetNeighbor): { left: number; right: number; top: number; bottom: number; count: number } {
    const left = +getNeighbor(-1, 0);
    const right = +getNeighbor(1, 0);
    const top = +getNeighbor(0, -1);
    const bottom = +getNeighbor(0, 1);

    return {
      left,
      right,
      top,
      bottom,
      count: left + right + top + bottom
    };
  }

  _getSideRotation({ right, top, bottom }: { right: number; top: number; bottom: number }): number {
    if (right) {
      return Math.PI;
    } else if (top) {
      return Math.PI / 2;
    } else if (bottom) {
      return -Math.PI / 2;
    }

    return 0;
  }

  _drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = +getNeighbor(-1, 0);
    const rightNeighbor = +getNeighbor(1, 0);
    const topNeighbor = +getNeighbor(0, -1);
    const bottomNeighbor = +getNeighbor(0, 1);

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawDot({ x, y, size }: DrawArgs): void {
    this._basicDot({ x, y, size, rotation: 0 });
  }

  _drawSquare({ x, y, size }: DrawArgs): void {
    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = +getNeighbor(-1, 0);
    const rightNeighbor = +getNeighbor(1, 0);
    const topNeighbor = +getNeighbor(0, -1);
    const bottomNeighbor = +getNeighbor(0, 1);

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this._basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicCornerRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  _drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = +getNeighbor(-1, 0);
    const rightNeighbor = +getNeighbor(1, 0);
    const topNeighbor = +getNeighbor(0, -1);
    const bottomNeighbor = +getNeighbor(0, 1);

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this._basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicCornerExtraRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  _drawClassy({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = +getNeighbor(-1, 0);
    const rightNeighbor = +getNeighbor(1, 0);
    const topNeighbor = +getNeighbor(0, -1);
    const bottomNeighbor = +getNeighbor(0, 1);

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawHorizontalRounded({ x, y, size: baseSize, getNeighbor }: DrawArgs): void {
    const { left, right } = this._getNeighbors(getNeighbor);
    const size = 0.86 * baseSize;
    const baseParams = { x, y, size };

    if (left && right) {
      return this._basicRectangle({
        x,
        y,
        xSize: baseSize,
        ySize: size
      });
    }

    if ((left && !right) || (!left && right)) {
      return this._reducedBasicSideRounded({ ...baseParams, rotation: right ? Math.PI : 0 }, baseSize);
    }

    this._basicReducedDot({ ...baseParams, rotation: 0 }, baseSize);
  }

  _drawVerticalRounded({ x, y, size: baseSize, getNeighbor }: DrawArgs): void {
    const { top, bottom } = this._getNeighbors(getNeighbor);
    const size = 0.86 * baseSize;
    const baseParams = { x, y, size };

    if (top && bottom) {
      return this._basicRectangle({
        x,
        y,
        xSize: size,
        ySize: baseSize
      });
    }

    if ((top && !bottom) || (!top && bottom)) {
      return this._reducedBasicSideRounded(
        {
          ...baseParams,
          rotation: top ? Math.PI / 2 : -Math.PI / 2
        },
        baseSize
      );
    }

    this._basicReducedDot({ ...baseParams, rotation: 0 }, baseSize);
  }

  _drawRibbon({ x, y, size, getNeighbor }: DrawArgs): void {
    const { top, bottom, right, count } = this._getNeighbors(getNeighbor);
    const args = { x, y, size };

    if (count !== 1) {
      return this._basicSquare({ ...args, rotation: 0 });
    }

    this._basicCornerRibbon({ ...args, rotation: this._getSideRotation({ right, top, bottom }) });
  }

  _drawDiamondSpecial({ x, y, size, getNeighbor }: DrawArgs): void {
    const { top, bottom, left, right, count } = this._getNeighbors(getNeighbor);
    const args = { x, y, size, rotation: 0 };

    if (count === 0) {
      return this._basicDiamond(args);
    }

    if (count === 1) {
      return this._basicSideDiamond({ ...args, rotation: this._getSideRotation({ right, top, bottom }) });
    }

    if (count === 2 && !(left && right) && !(top && bottom)) {
      let rotation = 0;
      if (top && left) {
        rotation = Math.PI / 2;
      } else if (top && right) {
        rotation = Math.PI;
      } else if (bottom && right) {
        rotation = -Math.PI / 2;
      }

      return this._basicCornerDiamond({ ...args, rotation });
    }

    this._basicSquare(args);
  }

  _drawShake({ x, y, xIndex, yIndex, size: baseSize, cornerIndex }: DrawArgs): void {
    const size = baseSize * 0.9;
    const maxRotation = Math.PI / 16;
    // 18 number in total, from -10 to -2 and from 2 to 10
    const maxNumbers = 18;
    const half = maxNumbers / 2;
    const maxNumber = maxNumbers / 2 + 1;

    // disperse the number
    let rotationNumber = (xIndex + 1) * (yIndex + 1) + cornerIndex;
    rotationNumber = ((rotationNumber >> 16) ^ rotationNumber) * 0x45d9f3b;
    rotationNumber = ((rotationNumber >> 16) ^ rotationNumber) * 0x45d9f3b;
    rotationNumber = (rotationNumber >> 16) ^ rotationNumber;
    // from 0 to 17
    rotationNumber %= maxNumbers;

    // from -10 to 2 and from 2 to 10
    if (rotationNumber < half) {
      rotationNumber = rotationNumber - half - 1;
    } else {
      rotationNumber = rotationNumber - half + 2;
    }

    // zero based
    rotationNumber = rotationNumber / maxNumber;

    this._basicReducedSquare({ x, y, size, rotation: rotationNumber * maxRotation }, baseSize);
  }
}
