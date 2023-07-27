import { CornerDotType } from "../../../types";
declare type DrawArgs = {
    x: number;
    y: number;
    size: number;
    rotation: number;
};
declare type BasicFigureDrawArgs = {
    x: number;
    y: number;
    size: number;
    rotation: number;
};
declare type RotateFigureArgs = {
    x: number;
    y: number;
    size: number;
    rotation: number;
    draw: () => void;
};
export default class QRCornerDot {
    _element?: SVGElement;
    _svg: SVGElement;
    _type: CornerDotType;
    constructor({ svg, type }: {
        svg: SVGElement;
        type: CornerDotType;
    });
    draw(x: number, y: number, size: number, rotation: number): void;
    _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void;
    _basicDot(args: BasicFigureDrawArgs): void;
    _basicSquare(args: BasicFigureDrawArgs): void;
    _drawDot({ x, y, size, rotation }: DrawArgs): void;
    _drawSquare({ x, y, size, rotation }: DrawArgs): void;
}
export {};
