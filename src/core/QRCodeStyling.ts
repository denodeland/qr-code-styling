import getMode from "../tools/getMode";
import mergeDeep from "../tools/merge";
import downloadURI from "../tools/downloadURI";
import QRCanvas from "./QRCanvas";
import defaultOptions, { Options, RequiredOptions } from "./QROptions";
import sanitizeOptions from "../tools/sanitizeOptions";
import { Extension, QRCode } from "../types";
import qrcode from "qrcode-generator";
import Worker from "../QRStyling.worker";

type DownloadOptions = {
  name?: string;
  extension?: Extension;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const worker = new Worker();
let id = 0;

export default class QRCodeStyling {
  _options: RequiredOptions;
  _container?: HTMLElement;
  _canvas?: HTMLCanvasElement;
  _qr?: QRCode;
  _drawingPromise?: Promise<void>;
  _id: number;
  _started: boolean;
  _resolveFrame: (image: void | ImageBitmap | null) => void;
  _resolveDrawingEnded?: () => void;
  _rejectDrawingEnded?: (error: Error | undefined) => void;
  _retryCount = 0;

  constructor(options: Partial<Options>, container: HTMLElement) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this._id = id++;
    this._started = false;
    this._container = container;
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
    this.clear = this.clear.bind(this);
    this._resolveFrame = () => null;
    this.update();
  }

  static _clearContainer(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = "";
    }
  }

  update(options?: Partial<Options>): void {
    QRCodeStyling._clearContainer(this._container);
    this._options = options ? sanitizeOptions(mergeDeep(this._options, options) as RequiredOptions) : this._options;

    if (!this._options.data) {
      return;
    }

    this._canvas = document.createElement("canvas");

    this.append(this._container);

    if (this._options.offscreen && "OffscreenCanvas" in window && "createImageBitmap" in window) {
      this.drawQRFromWorker();
    } else {
      this.drawQR();
    }
  }

  drawQR(): void {
    if (!this._canvas) return;

    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this._qr.make();

    const qrCanvas = new QRCanvas(this._options, this._canvas);
    this._drawingPromise = qrCanvas.drawQR(this._qr);
  }

  getFrameImage(): Promise<ImageBitmap | void | null> {
    return new Promise((resolve) => {
      this._resolveFrame = resolve;
      if (!this._options.frameOptions.image) resolve(undefined);
      const width = this._options.width + this._options.frameOptions.xSize * 2;
      const height = this._options.height + this._options.frameOptions.topSize + this._options.frameOptions.bottomSize;

      const img = new Image();
      img.onload = function () {
        createImageBitmap((img as unknown) as ImageBitmapSource, {
          resizeWidth: width * 2,
          resizeHeight: height * 2,
          resizeQuality: "high"
        })
          .then(resolve)
          .catch(console.log);
      };

      img.src = this._options.frameOptions.image;
    });
  }

  handleWorkerMessage(event: { data: { id: number; key: string; error?: Error } }): void {
    if (event.data.key === "drawingEnded" && event.data.id === this._id) {
      if (this._canvas && this._canvas.width === 10 && this._retryCount === 0) {
        this._retryCount++;
        this.update();
      } else if (this._resolveDrawingEnded) this._resolveDrawingEnded();
    }
    if (event.data.key === "error" && this._rejectDrawingEnded && event.data.id === this._id) {
      this._rejectDrawingEnded(event.data.error);
    }
  }

  async drawQRFromWorker(): Promise<void> {
    if (!this._canvas) return;
    if (!this._started) {
      this._started = true;
      worker.addEventListener("message", this.handleWorkerMessage);
    }

    // initial width for checking if the canvas was properly initialized
    this._canvas.width = 10;

    if (!this._drawingPromise) {
      this._drawingPromise = new Promise((resolve, reject) => {
        this._resolveDrawingEnded = resolve;
        this._rejectDrawingEnded = reject;
      });
    }

    // previous getFrame
    this._resolveFrame(null);
    const frameImage = await this.getFrameImage();

    // ignore previous postMessage
    if (frameImage !== null) {
      const offscreen = this._canvas.transferControlToOffscreen();

      worker.postMessage({ key: "initCanvas", canvas: offscreen, options: this._options, id: this._id, frameImage }, [
        offscreen
      ]);
    }
  }

  append(container?: HTMLElement): void {
    if (!container) {
      return;
    }

    if (typeof container.appendChild !== "function") {
      throw "Container should be a single DOM node";
    }

    if (this._canvas) {
      container.appendChild(this._canvas);
    }

    this._container = container;
  }

  download(downloadOptions?: Partial<DownloadOptions> | string): void {
    if (!this._drawingPromise) return;

    this._drawingPromise.then(() => {
      if (!this._canvas) return;

      let extension = "png";
      let name = "qr";

      //TODO remove deprecated code in the v2
      if (typeof downloadOptions === "string") {
        extension = downloadOptions;
        console.warn(
          "Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument"
        );
      } else if (typeof downloadOptions === "object" && downloadOptions !== null) {
        if (downloadOptions.name) {
          name = downloadOptions.name;
        }
        if (downloadOptions.extension) {
          extension = downloadOptions.extension;
        }
      }

      const data = this._canvas.toDataURL(`image/${extension}`);
      downloadURI(data, `${name}.${extension}`);
    });
  }

  clear(): void {
    worker.removeEventListener("message", this.handleWorkerMessage);
  }
}
