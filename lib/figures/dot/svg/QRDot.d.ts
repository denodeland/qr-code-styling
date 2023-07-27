import { DotType } from "../../../types";
declare type GetNeighbor = (x: number, y: number) => boolean;
declare type DrawArgs = {
    x: number;
    y: number;
    size: number;
    getNeighbor: GetNeighbor;
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
export default class QRDot {
    _element?: SVGElement;
    _svg: SVGElement;
    _type: DotType;
    constructor({ svg, type }: {
        svg: SVGElement;
        type: DotType;
    });
    draw(x: number, y: number, size: number, getNeighbor: GetNeighbor): void;
    _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void;
    _basicDot(args: BasicFigureDrawArgs): void;
    _basicSquare(args: BasicFigureDrawArgs): void;
    _basicSideRounded(args: BasicFigureDrawArgs): void;
    _basicCornerRounded(args: BasicFigureDrawArgs): void;
    _basicCornerExtraRounded(args: BasicFigureDrawArgs): void;
    _basicCornersRounded(args: BasicFigureDrawArgs): void;
    _drawDot({ x, y, size }: DrawArgs): void;
    _drawSquare({ x, y, size }: DrawArgs): void;
    _drawRounded({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawClassy({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void;
}
export {};
