import getMode from "../tools/getMode";
import mergeDeep from "../tools/merge";
import downloadURI from "../tools/downloadURI";
import QRCanvas from "./QRCanvas";
import defaultOptions, { Options, RequiredOptions, FrameOptions } from "./QROptions";
import QRSVG from "./QRSVG";
import drawTypes from "../constants/drawTypes";
import sanitizeOptions from "../tools/sanitizeOptions";
import { Extension, QRCode } from "../types";
import qrcode from "qrcode-generator";
import Worker from "../QRStyling.worker";

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

type DownloadOptions = {
  name?: string;
  extension?: Extension;
};

let workerError = false;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const worker = new Worker();
worker.onerror = (event: ErrorEvent) => {
  workerError = true;
  window.dispatchEvent(new CustomEvent("workerError"));
  console.error(`Worker error: ${event.message}`);
};

let id = 0;

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
  _retryCount = 0;

  constructor(options: Partial<Options>, container: HTMLElement) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this._originalOptions = { ...this._options };
    this._options.offscreen = workerError ? false : this._options.offscreen;
    this._id = id++;
    this._started = false;
    this._container = container;
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
    this.handleWorkerError = this.handleWorkerError.bind(this);
    this.clear = this.clear.bind(this);
    this._resolveImages = () => null;
    this.update();

    if (this._options.offscreen) {
      window.addEventListener("workerError", this.handleWorkerError);
    }
  }

  static _clearContainer(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = "";
    }
  }

  handleWorkerError(): void {
    this._options.offscreen = false;
    this.update();
    window.removeEventListener("workerError", this.handleWorkerError);
  }

  update(options?: Partial<RequiredOptions>): void {
    QRCodeStyling._clearContainer(this._container);

    if (options?.frameOptions) {
      this._options.frameOptions = { ...options?.frameOptions };
    }
    if (options?.backgroundOptions) {
      this._options.backgroundOptions = { ...options?.backgroundOptions };
    }
    if (options?.cornersDotOptions) {
      this._options.cornersDotOptions = { ...options?.cornersDotOptions };
    }
    if (options?.cornersSquareOptions) {
      this._options.cornersSquareOptions = { ...options?.cornersSquareOptions };
    }
    if (options?.dotsOptions) {
      this._options.dotsOptions = { ...options?.dotsOptions };
    }

    this._options = options ? sanitizeOptions(mergeDeep(this._options, options) as RequiredOptions) : this._options;

    if (!this._options.data) {
      return;
    }

    if (this._options.type === drawTypes.svg) {
      return this.drawSvgQR();
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
    if (!this._drawingPromise) {
      this._drawingPromise = qrCanvas.drawQR(this._qr);
    } else {
      qrCanvas.drawQR(this._qr).then(this._resolveDrawingEnded, this._rejectDrawingEnded);
    }
  }

  drawSvgQR(): void {
    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this._qr.make();

    this._svg = new QRSVG(this._options);
    this.append(this._container);

    this._drawingPromise = this._svg.drawQR(this._qr);
  }

  getImage(image: string, width: number, height: number): Promise<ImageBitmap | void> {
    return new Promise((resolve, reject) => {
      if (!image) return resolve(undefined);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        let resizeHeight = Math.round(height || img.height / (img.width / width));

        // firefox patch, svg images have no height unless they are in the DOM
        if (!resizeHeight) {
          img.style.visibility = "hidden";
          document.body.appendChild(img);
          resizeHeight = Math.round(img.height / (img.width / width));
          img.remove();
        }

        const imgUnknown = img as unknown;
        createImageBitmap(imgUnknown as ImageBitmapSource, {
          resizeWidth: Math.round(width),
          resizeHeight,
          resizeQuality: "high"
        })
          .then(resolve)
          .catch(reject);
      };

      img.onerror = () => {
        reject(new Error("Image load error"));
      };

      img.src = image;
    });
  }

  getXPadding(options: FrameOptions): number {
    if (options.rightSize) {
      const { leftSize = 0, rightSize = 0 } = options;
      return leftSize + rightSize;
    }
    const { xSize = 0 } = options;
    return xSize * 2;
  }

  getImages(): Promise<(ImageBitmap | void)[] | null> {
    return new Promise((resolve, reject) => {
      this._resolveImages = resolve;
      const frameImagePromise = this.getImage(
        this._options.frameOptions.image,
        this._options.width + this.getXPadding(this._options.frameOptions),
        this._options.height + this._options.frameOptions.topSize + this._options.frameOptions.bottomSize
      );

      // only creates the ImageBitmap when the image is an svg
      const qrImage = /\.svg$/.test(this._options.image || "") ? this._options.image : "";
      const qrImagePromise = this.getImage(qrImage || "", this._options.width / 2, 0);

      Promise.all([frameImagePromise, qrImagePromise]).then(resolve).catch(reject);
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
    this._resolveImages(null);
    try {
      const images = await this.getImages();
      // ignore previous postMessage
      if (images !== null) {
        const [frameImage, qrImage] = images;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const offscreen = (this._canvas as any).transferControlToOffscreen();

        worker.postMessage(
          { key: "initCanvas", canvas: offscreen, options: this._options, id: this._id, frameImage, qrImage },
          [offscreen]
        );
      }
    } catch (error) {
      if (this._rejectDrawingEnded) {
        this._rejectDrawingEnded(error);
      }
    }
  }

  append(container?: HTMLElement): void {
    if (!container) {
      return;
    }

    if (typeof container.appendChild !== "function") {
      throw "Container should be a single DOM node";
    }

    if (this._options.type === drawTypes.canvas) {
      if (this._canvas) {
        container.appendChild(this._canvas);
      }
    } else {
      if (this._svg) {
        container.appendChild(this._svg.getElement());
      }

      this._container = container;
    }
  }

  parseDownloadOptions(downloadOptions?: Partial<DownloadOptions> | string): { name: string; extension: Extension } {
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

    return { name, extension: extension as Extension };
  }

  async download(downloadOptions?: Partial<DownloadOptions> | string): Promise<void> {
    if (!this._drawingPromise) return Promise.resolve();

    const { name, extension } = this.parseDownloadOptions(downloadOptions);

    if (extension.toLowerCase() === "svg") {
      return this.downloadSvg(name);
    }

    await this._drawingPromise;

    if (!this._canvas) return;

    const data = this._canvas.toDataURL(`image/${extension}`);
    downloadURI(data, `${name}.${extension}`);
  }

  async getSvgString(): Promise<string> {
    if (!this._drawingPromise) return "";

    if (!this._qr) throw "QR code is empty";

    let svg: QRSVG;

    if (this._options.type === drawTypes.svg) {
      svg = this._svg as QRSVG;
      await this._drawingPromise;
    } else {
      svg = new QRSVG(this._originalOptions);
      await svg.drawQR(this._qr);
    }

    const serializer = new XMLSerializer();
    return '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg.getElement());
  }

  async downloadSvg(name: string): Promise<void> {
    const svgString = await this.getSvgString();

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    downloadURI(url, `${name}.svg`);
  }

  async getSvgFile(): Promise<Blob> {
    const svgString = await this.getSvgString();

    return new Blob([svgString], { type: "image/svg+xml" });
  }

  clear(): void {
    if (this._options.offscreen) {
      worker.removeEventListener("message", this.handleWorkerMessage);
      window.removeEventListener("workerError", this.handleWorkerError);
    }
  }
}
