import cornerSquareTypes from "../../../constants/cornerSquareTypes";
import { CornerSquareType } from "../../../types";
import { cornerSquarePathBuilder } from "../../PathBuilder";

type DrawArgs = {
  x: number;
  y: number;
  size: number;
  context: CanvasRenderingContext2D;
  rotation: number;
};

type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  context: CanvasRenderingContext2D;
  rotation: number;
};

type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  context: CanvasRenderingContext2D;
  rotation: number;
  draw: () => void;
};

export default class QRCornerSquare {
  _context: CanvasRenderingContext2D;
  _type: CornerSquareType;

  static loadPath(type: string | undefined): Promise<void> {
    return cornerSquarePathBuilder.loadPath(type);
  }

  constructor({ context, type }: { context: CanvasRenderingContext2D; type: CornerSquareType }) {
    this._context = context;
    this._type = type;
  }

  draw(x: number, y: number, size: number, rotation: number): void {
    const context = this._context;
    const type = this._type;
    let drawFunction;

    switch (type) {
      case cornerSquareTypes.square:
        drawFunction = this._drawSquare;
        break;
      case cornerSquareTypes.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case cornerSquareTypes.shape1:
      case cornerSquareTypes.shape2:
      case cornerSquareTypes.shape3:
      case cornerSquareTypes.shape4:
      case cornerSquareTypes.shape5:
      case cornerSquareTypes.shape6:
      case cornerSquareTypes.shape7:
      case cornerSquareTypes.shape8:
      case cornerSquareTypes.shape9:
      case cornerSquareTypes.shape10:
      case cornerSquareTypes.shape11:
      case cornerSquareTypes.shape12:
        drawFunction = this._drawPath;
        break;
      case cornerSquareTypes.dot:
      default:
        drawFunction = this._drawDot;
    }

    drawFunction.call(this, { x, y, size, context, rotation });
  }

  _rotateFigure({ x, y, size, context, rotation, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size, context } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
        context.arc(0, 0, size / 2 - dotSize, 0, Math.PI * 2);
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, context } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.rect(-size / 2, -size / 2, size, size);
        context.rect(-size / 2 + dotSize, -size / 2 + dotSize, size - 2 * dotSize, size - 2 * dotSize);
      }
    });
  }

  _basicExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, context } = args;
    const dotSize = size / 7;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(-dotSize, -dotSize, 2.5 * dotSize, Math.PI, -Math.PI / 2);
        context.lineTo(dotSize, -3.5 * dotSize);
        context.arc(dotSize, -dotSize, 2.5 * dotSize, -Math.PI / 2, 0);
        context.lineTo(3.5 * dotSize, -dotSize);
        context.arc(dotSize, dotSize, 2.5 * dotSize, 0, Math.PI / 2);
        context.lineTo(-dotSize, 3.5 * dotSize);
        context.arc(-dotSize, dotSize, 2.5 * dotSize, Math.PI / 2, Math.PI);
        context.lineTo(-3.5 * dotSize, -dotSize);

        context.arc(-dotSize, -dotSize, 1.5 * dotSize, Math.PI, -Math.PI / 2);
        context.lineTo(dotSize, -2.5 * dotSize);
        context.arc(dotSize, -dotSize, 1.5 * dotSize, -Math.PI / 2, 0);
        context.lineTo(2.5 * dotSize, -dotSize);
        context.arc(dotSize, dotSize, 1.5 * dotSize, 0, Math.PI / 2);
        context.lineTo(-dotSize, 2.5 * dotSize);
        context.arc(-dotSize, dotSize, 1.5 * dotSize, Math.PI / 2, Math.PI);
        context.lineTo(-2.5 * dotSize, -dotSize);
      }
    });
  }

  _drawDot({ x, y, size, context, rotation }: DrawArgs): void {
    this._basicDot({ x, y, size, context, rotation });
  }

  _drawSquare({ x, y, size, context, rotation }: DrawArgs): void {
    this._basicSquare({ x, y, size, context, rotation });
  }

  _drawExtraRounded({ x, y, size, context, rotation }: DrawArgs): void {
    this._basicExtraRounded({ x, y, size, context, rotation });
  }

  _drawPath({ x, y, size, context }: DrawArgs): void {
    const path2D = new Path2D(cornerSquarePathBuilder.build({ type: this._type, size, x, y }));
    context.fill(path2D);
  }
}
