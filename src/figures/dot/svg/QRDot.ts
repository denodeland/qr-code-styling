import { DotType } from "../../../types";
import { dotPathBuilder } from "../../PathBuilder";
import QRDotBase, { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs, RotateRectangleArgs } from "../QRDotBase";

export default class QRDot extends QRDotBase {
  _element?: SVGElement;
  _svg: SVGElement;
  _type: DotType;

  constructor({ svg, type }: { svg: SVGElement; type: DotType }) {
    super();

    this._svg = svg;
    this._type = type;
  }

  _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  _rotateRectangle({ x, y, xSize, ySize, rotation, draw }: RotateRectangleArgs): void {
    const cx = x + xSize / 2;
    const cy = y + ySize / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(x + size / 2));
        this._element.setAttribute("cy", String(y + size / 2));
        this._element.setAttribute("r", String(size / 2));
      }
    });
  }

  _basicReducedDot(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size } = args;
    const dotCenter = (baseSize - size) / 2;
    const x = args.x + dotCenter;
    const y = args.y + dotCenter;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(x + size / 2));
        this._element.setAttribute("cy", String(y + size / 2));
        this._element.setAttribute("r", String(size / 2));
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  _basicReducedSquare(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size } = args;
    const dotCenter = Math.round((baseSize - size) / 2);
    const x = args.x + dotCenter;
    const y = args.y + dotCenter;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  _basicRectangle(args: { x: number; y: number; xSize: number; ySize: number }): void {
    const { xSize, ySize } = args;
    let { x, y } = args;

    if (xSize < ySize) {
      x += (ySize - xSize) / 2;
    } else {
      y += (xSize - ySize) / 2;
    }

    this._rotateRectangle({
      ...args,
      rotation: 0,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(xSize));
        this._element.setAttribute("height", String(ySize));
      }
    });
  }

  //if rotation === 0 - right side is rounded
  _basicSideRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size / 2}` + //draw line to left bottom corner + half of size right
            `a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}` // draw rounded corner
        );
      }
    });
  }

  _reducedBasicSideRounded(args: BasicFigureDrawArgs, baseSize: number): void {
    const { size, rotation } = args;
    const length = baseSize / 2 + size / 2;
    let { x, y } = args;

    if (rotation === Math.PI / 2 || rotation === -Math.PI / 2) {
      x += (baseSize - length) / 2;
      y += (baseSize - length) / 2 + (rotation === Math.PI / 2 ? 0 : baseSize / 2 - size / 2);
    } else {
      x += rotation === 0 ? 0 : baseSize - length;
      y += (baseSize - size) / 2;
    }

    this._rotateRectangle({
      x,
      y,
      xSize: length,
      ySize: size,
      rotation,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${baseSize / 2}` + //draw line to left bottom corner + half of size right
            `a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}` // draw rounded corner
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size}` + //draw line to right bottom corner
            `v ${-size / 2}` + //draw line to right bottom corner + half of size top
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded corner
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size}` + //draw line to right bottom corner
            `a ${size} ${size}, 0, 0, 0, ${-size} ${-size}` // draw rounded top right corner
        );
      }
    });
  }

  //if rotation === 0 - left bottom and right top corners are rounded
  _basicCornersRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to left top position
            `v ${size / 2}` + //draw line to left top corner + half of size bottom
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}` + // draw rounded left bottom corner
            `h ${size / 2}` + //draw line to right bottom corner
            `v ${-size / 2}` + //draw line to right bottom corner + half of size top
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded right top corner
        );
      }
    });
  }

  _basicCornerRibbon(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const halfSize = size / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y} h ${size} l ${-halfSize} ${halfSize} l ${halfSize} ${halfSize} h ${-size} z`
        );
      }
    });
  }

  _basicDiamond(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const halfSize = size / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x + halfSize} ${y} l ${halfSize} ${halfSize} l ${-halfSize} ${halfSize} l ${-halfSize} ${-halfSize} z`
        );
      }
    });
  }

  _basicSideDiamond(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const halfSize = size / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y} h ${halfSize} l ${halfSize} ${halfSize} l ${-halfSize} ${halfSize} h ${-halfSize} z`
        );
      }
    });
  }

  _basicCornerDiamond(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const halfSize = size / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y} h ${halfSize} l ${halfSize} ${halfSize} v ${halfSize} h ${-size} z`
        );
      }
    });
  }

  _drawPath({ x, y, size }: DrawArgs): void {
    this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this._element.setAttribute("d", dotPathBuilder.build({ type: this._type, size, x, y }));
  }
}
