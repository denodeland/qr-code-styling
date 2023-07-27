import { Options, RequiredOptions, FrameOptions } from "./QROptions";
import QRSVG from "./QRSVG";
import { Extension, QRCode } from "../types";
declare type DownloadOptions = {
    name?: string;
    extension?: Extension;
};
export default class QRCodeStyling {
    _options: RequiredOptions;
    _originalOptions: RequiredOptions;
    _container?: HTMLElement;
    _canvas?: HTMLCanvasElement;
    _svg?: QRSVG;
    _qr?: QRCode;
    _drawingPromise?: Promise<void>;
    _id: number;
    _started: boolean;
    _resolveImages: (image: void[] | ImageBitmap[] | null) => void;
    _resolveDrawingEnded?: () => void;
    _rejectDrawingEnded?: (error: Error | undefined | unknown) => void;
    _retryCount: number;
    constructor(options: Partial<Options>, container: HTMLElement);
    static _clearContainer(container?: HTMLElement): void;
    handleWorkerError(): void;
    update(options?: Partial<RequiredOptions>): void;
    drawQR(): void;
    drawSvgQR(): void;
    getImage(image: string, width: number, height: number): Promise<ImageBitmap | void>;
    getXPadding(options: FrameOptions): number;
    getImages(): Promise<(ImageBitmap | void)[] | null>;
    handleWorkerMessage(event: {
        data: {
            id: number;
            key: string;
            error?: Error;
        };
    }): void;
    drawQRFromWorker(): Promise<void>;
    append(container?: HTMLElement): void;
    parseDownloadOptions(downloadOptions?: Partial<DownloadOptions> | string): {
        name: string;
        extension: Extension;
    };
    download(downloadOptions?: Partial<DownloadOptions> | string): Promise<void>;
    downloadSvg(name: string): Promise<void>;
    clear(): void;
}
export {};
