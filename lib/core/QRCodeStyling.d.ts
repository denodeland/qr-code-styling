import { Options, RequiredOptions } from "./QROptions";
import { Extension, QRCode } from "../types";
declare type DownloadOptions = {
    name?: string;
    extension?: Extension;
};
export default class QRCodeStyling {
    _options: RequiredOptions;
    _container?: HTMLElement;
    _canvas?: HTMLCanvasElement;
    _qr?: QRCode;
    _drawingPromise?: Promise<void>;
    _id: number;
    _started: boolean;
    _resolveDrawingEnded?: () => void;
    _retryCount: number;
    constructor(options: Partial<Options>, container: HTMLElement);
    static _clearContainer(container?: HTMLElement): void;
    update(options?: Partial<Options>): void;
    drawQR(): void;
    getFrameImage(): Promise<ImageBitmap | void>;
    handleWorkerMessage(event: {
        data: {
            id: number;
            key: string;
        };
    }): void;
    drawQRFromWorker(): Promise<void>;
    append(container?: HTMLElement): void;
    download(downloadOptions?: Partial<DownloadOptions> | string): void;
    clear(): void;
}
export {};
