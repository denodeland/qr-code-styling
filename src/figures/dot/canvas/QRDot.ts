import { DotType } from "../../../types";
import { dotPathBuilder } from "../../PathBuilder";
import QRDotBase, { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs, RotateRectangleArgs } from "../QRDotBase";

export default class QRDot extends QRDotBase {
  _context: CanvasRenderingContext2D;
  _type: DotType;

  constructor({ context, type }: { context: CanvasRenderingContext2D; type: DotType }) {
    super();

    this._context = context;
    this._type = type;
  }

  _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    this._context.translate(cx, cy);
    rotation && this._context.rotate(rotation);
    draw();
    this._context.closePath();
    rotation && this._context.rotate(-rotation);
    this._context.translate(-cx, -cy);
  }

  _rotateRectangle({ x, y, xSize, ySize, rotation, draw }: RotateRectangleArgs): void {
    const cx = Math.round(x + xSize / 2);
    const cy = Math.round(y + ySize / 2);

    this._context.translate(cx, cy);
    rotation && this._context.rotate(rotation);
    draw();
    this._context.closePath();
    rotation && this._context.rotate(-rotation);
    this._context.translate(-cx, -cy);
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.arc(0, 0, size / 2, 0, Math.PI * 2);
      }
    });
  }

  _basicReducedDot(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size } = args;
    const dotCenter = Math.round((baseSize - size) / 2);
    const x = args.x + dotCenter;
    const y = args.y + dotCenter;

    this._rotateFigure({
      ...args,
      x,
      y,
      draw: () => {
        this._context.arc(0, 0, size / 2, 0, Math.PI * 2);
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.rect(-size / 2, -size / 2, size, size);
      }
    });
  }

  _basicReducedSquare(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size, x, y } = args;
    const dotCenter = Math.round((baseSize - size) / 2);

    this._rotateFigure({
      ...args,
      x,
      y,
      draw: () => {
        this._context.rect(-size / 2 + dotCenter, -size / 2 + dotCenter, size, size);
      }
    });
  }

  //if rotation === 0 - right side is rounded
  _basicSideRounded(args: BasicFigureDrawArgs): void {
    const { size } = args;
    const context = this._context;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, -Math.PI / 2, Math.PI / 2);
        context.lineTo(-size / 2, size / 2);
        context.lineTo(-size / 2, -size / 2);
        context.lineTo(0, -size / 2);
      }
    });
  }

  _reducedBasicSideRounded(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size, x, y, rotation } = args;
    const context = this._context;
    let xSize = size;
    let ySize = size;

    if (rotation === 0 || rotation === Math.PI) {
      xSize = baseSize;
      ySize = baseSize;
    } else {
      ySize = baseSize;
    }

    this._rotateRectangle({
      x: x + Math.round((baseSize - size) / 2),
      y,
      xSize,
      ySize,
      rotation,
      draw: () => {
        context.arc(0, 0, size / 2, -Math.PI / 2, Math.PI / 2);
        context.lineTo(-baseSize / 2, size / 2);
        context.lineTo(-baseSize / 2, -size / 2);
        context.lineTo(0, -size / 2);
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerRounded(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.arc(0, 0, size / 2, -Math.PI / 2, 0);
        this._context.lineTo(size / 2, size / 2);
        this._context.lineTo(-size / 2, size / 2);
        this._context.lineTo(-size / 2, -size / 2);
        this._context.lineTo(0, -size / 2);
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerExtraRounded(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
        this._context.lineTo(-size / 2, size / 2);
        this._context.lineTo(-size / 2, -size / 2);
      }
    });
  }

  _basicCornersRounded(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.arc(0, 0, size / 2, -Math.PI / 2, 0);
        this._context.lineTo(size / 2, size / 2);
        this._context.lineTo(0, size / 2);
        this._context.arc(0, 0, size / 2, Math.PI / 2, Math.PI);
        this._context.lineTo(-size / 2, -size / 2);
        this._context.lineTo(0, -size / 2);
      }
    });
  }

  _basicCornersExtraRounded(args: BasicFigureDrawArgs): void {
    const { size } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
        this._context.arc(size / 2, -size / 2, size, Math.PI / 2, Math.PI);
      }
    });
  }

  _basicRectangle(args: { x: number; y: number; xSize: number; ySize: number }): void {
    const { xSize, ySize } = args;
    let { x, y } = args;
    const context = this._context;

    if (xSize < ySize) {
      x += Math.round((ySize - xSize) / 2);
    } else {
      x += Math.round((xSize - ySize) / 2);
      y += Math.round((xSize - ySize) / 2);
    }

    this._rotateRectangle({
      x,
      y,
      xSize,
      ySize,
      rotation: 0,
      draw() {
        context.rect(-xSize / 2, -ySize / 2, xSize, ySize);
      }
    });
  }

  _basicCornerRibbon(args: BasicFigureDrawArgs): void {
    const { size } = args;
    const context = this._context;
    const halfSize = size / 2;
    const x = -halfSize;
    const y = -halfSize;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.lineTo(x, y);
        context.lineTo(x + size, y);
        context.lineTo(x + halfSize, y + halfSize);
        context.lineTo(x + size, y + size);
        context.lineTo(x, y + size);
      }
    });
  }

  _basicDiamond(args: BasicFigureDrawArgs): void {
    const { size } = args;
    const context = this._context;
    const halfSize = size / 2;
    const x = 0;
    const y = -halfSize;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.lineTo(x, y);
        context.lineTo(x + halfSize, y + halfSize);
        context.lineTo(x, y + size);
        context.lineTo(x - halfSize, y + halfSize);
        context.lineTo(x, y);
      }
    });
  }

  _basicSideDiamond(args: BasicFigureDrawArgs): void {
    const { size } = args;
    const context = this._context;
    const halfSize = size / 2;
    const x = -halfSize;
    const y = -halfSize;

    this._rotateFigure({
      ...args,
      draw: () => {
        // left top corner
        context.lineTo(x, y);
        context.lineTo(x + halfSize, y);
        context.lineTo(x + size, y + halfSize);
        context.lineTo(x + halfSize, y + size);
        context.lineTo(x, y + size);
        context.lineTo(x, y);
      }
    });
  }

  _basicCornerDiamond(args: BasicFigureDrawArgs): void {
    const { size } = args;
    const context = this._context;
    const halfSize = size / 2;
    const x = -halfSize;
    const y = -halfSize;

    this._rotateFigure({
      ...args,
      draw: () => {
        // left top corner
        context.lineTo(x, y);
        context.lineTo(x + halfSize, y);
        context.lineTo(x + size, y + halfSize);
        context.lineTo(x + size, y + size);
        context.lineTo(x, y + size);
        context.lineTo(x, y);
      }
    });
  }

  _drawPath({ x, y, size }: DrawArgs): void {
    const path2D = new Path2D(dotPathBuilder.build({ type: this._type, size, x, y }));
    this._context.fill(path2D);
  }
}
