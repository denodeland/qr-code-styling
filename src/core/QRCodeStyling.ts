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
  _resolveDrawingEnded?: () => void;

  constructor(options?: Partial<Options>) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this._id = id++;
    this._started = false;
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

    if (this._options.offscreen && "OffscreenCanvas" in window && "createImageBitmap" in window) {
      this.drawQRFromWorker();
    } else {
      this.drawQR();
    }

    this.append(this._container);
  }

  drawQR(): void {
    if (!this._canvas) return;

    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this._qr.make();

    const qrCanvas = new QRCanvas(this._options, this._canvas);
    this._drawingPromise = qrCanvas.drawQR(this._qr);
  }

  getFrameImage(): Promise<ImageBitmap | void> {
    return new Promise((resolve) => {
      if (!this._options.frameOptions.image) resolve(undefined);
      const width = this._options.width + this._options.frameOptions.xSize * 2;
      const height = this._options.height + this._options.frameOptions.topSize + this._options.frameOptions.bottomSize;

      const img = new Image();
      img.onload = function () {
        resolve(
          createImageBitmap((img as unknown) as ImageBitmapSource, {
            resizeWidth: width * 2,
            resizeHeight: height * 2,
            resizeQuality: "high"
          })
        );
      };

      img.src = this._options.frameOptions.image;
    });
  }

  async drawQRFromWorker(): Promise<void> {
    if (!this._canvas) return;
    if (!this._started) {
      this._started = true;
      worker.addEventListener("message", (event: { data: { id: number; key: string } }) => {
        if (event.data.key === "drawingEnded" && event.data.id === this._id) {
          if (this._resolveDrawingEnded) this._resolveDrawingEnded();
        }
      });
    }

    this._drawingPromise = new Promise((resolve) => {
      this._resolveDrawingEnded = resolve;
    });

    const offscreen = this._canvas.transferControlToOffscreen();
    const frameImage = await this.getFrameImage();

    worker.postMessage({ key: "initCanvas", canvas: offscreen, options: this._options, frameImage, id: this._id }, [
      offscreen
    ]);
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
}
