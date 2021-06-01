import { RequiredOptions, Gradient } from "./QROptions";
import { QRCode } from "../types";
declare type FilterFunction = (i: number, j: number) => boolean;
export default class QRCanvas {
    _canvas: HTMLCanvasElement;
    _options: RequiredOptions;
    _qr?: QRCode;
    _image?: HTMLImageElement | ImageBitmap;
    _workerCtx: Worker;
    _frameImage: ImageBitmap | HTMLImageElement | void;
    constructor(options: RequiredOptions, canvas: HTMLCanvasElement, frameImage?: ImageBitmap);
    get context(): CanvasRenderingContext2D | null;
    get width(): number;
    get height(): number;
    get isWorker(): boolean;
    getCanvas(): HTMLCanvasElement;
    clear(): void;
    drawQR(qr: QRCode): Promise<void>;
    loadFrameImage(): Promise<void>;
    drawFrame(): void;
    drawFrameBackground(): void;
    drawBackground(): void;
    drawDots(filter?: FilterFunction): void;
    drawCorners(filter?: FilterFunction): void;
    loadAssets(): Promise<void[]>;
    loadImage(): Promise<void>;
    loadImageFromWorker(): Promise<void>;
    drawImage({ width, height, count, dotSize }: {
        width: number;
        height: number;
        count: number;
        dotSize: number;
    }): void;
    fillRoundRect(x: number, y: number, width: number, height: number, radius: number): void;
    _createGradient({ context, options, additionalRotation, x, y, size }: {
        context: CanvasRenderingContext2D;
        options: Gradient;
        additionalRotation: number;
        x: number;
        y: number;
        size: number;
    }): CanvasGradient;
}
export {};
