import calculateImageSize from "../tools/calculateImageSize";
import errorCorrectionPercents from "../constants/errorCorrectionPercents";
import QRDot from "../figures/dot/svg/QRDot";
import QRCornerSquare from "../figures/cornerSquare/svg/QRCornerSquare";
import QRCornerDot from "../figures/cornerDot/svg/QRCornerDot";
import { RequiredOptions, Gradient } from "./QROptions";
import gradientTypes from "../constants/gradientTypes";
import { QRCode } from "../types";

type FilterFunction = (i: number, j: number) => boolean;

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

export default class QRSVG {
  _element: SVGElement;
  _defs: SVGElement;
  _dotsClipPath?: SVGElement;
  _cornersSquareClipPath?: SVGElement;
  _cornersDotClipPath?: SVGElement;
  _options: RequiredOptions;
  _qr?: QRCode;
  _image?: HTMLImageElement;
  _svgImageElement?: SVGSVGElement;
  _svgImageWidth?: number;
  _svgImageHeight?: number;
  _baseWidth = 0;
  _svgWidth = 0;
  _svgHeight = 0;

  //TODO don't pass all options to this class
  constructor(options: RequiredOptions) {
    this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._options = options;
    this.processSizes();
    this._element.setAttribute("width", String(this._svgWidth));
    this._element.setAttribute("height", String(this._svgHeight));
    this._element.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._element.appendChild(this._defs);
  }

  get width(): number {
    return this._options.width;
  }

  get height(): number {
    return this._options.height;
  }

  get xPadding(): number {
    const { frameOptions } = this._options;
    if (frameOptions.rightSize) {
      const { leftSize = 0, rightSize = 0 } = frameOptions;
      return leftSize + rightSize;
    }
    const { xSize = 0 } = frameOptions;
    return xSize * 2;
  }

  calcSize(multiplier: number, size: number): number {
    if (!size) {
      return size || 0;
    }

    return Math.round(multiplier * size);
  }

  processSizes(): void {
    const { frameOptions, width, height } = this._options;
    if (!frameOptions.svgContent) {
      this._svgWidth = width;
      this._svgHeight = height;
      this._baseWidth = width;
      return;
    }

    const multiplier = frameOptions.svgWidth / (width + this.xPadding);
    frameOptions.leftSize = this.calcSize(multiplier, frameOptions.leftSize);
    frameOptions.rightSize = this.calcSize(multiplier, frameOptions.rightSize);
    frameOptions.xSize = this.calcSize(multiplier, frameOptions.xSize);
    frameOptions.topSize = this.calcSize(multiplier, frameOptions.topSize);
    frameOptions.bottomSize = this.calcSize(multiplier, frameOptions.bottomSize);
    this._options.margin = this.calcSize(multiplier, this._options.margin);
    this._baseWidth = frameOptions.svgWidth - this.xPadding;
    this._svgWidth = width;
    this._svgHeight = Math.round(width * (frameOptions.svgHeight / frameOptions.svgWidth));
    this._options.width = frameOptions.svgWidth;
    this._options.height = frameOptions.svgHeight;
  }

  getElement(): SVGElement {
    return this._element;
  }

  clear(): void {
    this._element?.parentNode?.replaceChild(this._element.cloneNode(false), this._element);
  }

  async drawQR(qr: QRCode): Promise<void> {
    const count = qr.getModuleCount();
    const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2 - this.xPadding;
    const dotSize = Math.floor(minSize / count);
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };

    this._qr = qr;
    this.clear();

    if (this._options.image) {
      await this.loadImage();
      if (!this._image && !this._svgImageElement) return;
      const { imageOptions, qrOptions } = this._options;
      const coverLevel = imageOptions.imageSize * errorCorrectionPercents[qrOptions.errorCorrectionLevel];
      const maxHiddenDots = Math.floor(coverLevel * count * count);

      drawImageSize = calculateImageSize({
        originalWidth: this._image?.width || this._svgImageWidth || 0,
        originalHeight: this._image?.height || this._svgImageHeight || 0,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize
      });
    }

    this.drawFrameBackground();
    this.drawFrame();
    this.drawBackground();
    this.drawDots((i: number, j: number): boolean => {
      if (this._options.imageOptions.hideBackgroundDots) {
        if (
          i >= (count - drawImageSize.hideXDots) / 2 &&
          i < (count + drawImageSize.hideXDots) / 2 &&
          j >= (count - drawImageSize.hideYDots) / 2 &&
          j < (count + drawImageSize.hideYDots) / 2
        ) {
          return false;
        }
      }

      if (squareMask[i]?.[j] || squareMask[i - count + 7]?.[j] || squareMask[i]?.[j - count + 7]) {
        return false;
      }

      if (dotMask[i]?.[j] || dotMask[i - count + 7]?.[j] || dotMask[i]?.[j - count + 7]) {
        return false;
      }

      return true;
    });
    await this.drawCorners();

    if (this._options.image) {
      this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }

  drawFrame(): void {
    this._element.insertAdjacentHTML("beforeend", this._options.frameOptions.svgContent);
  }

  drawFrameBackground(): void {
    const element = this._element;
    const { frameOptions } = this._options;

    if (!element || (!frameOptions?.background?.color && !frameOptions?.background?.gradient)) {
      return;
    }

    this._createColor({
      options: frameOptions.background.gradient,
      color: frameOptions.background.color,
      additionalRotation: 0,
      x: 0,
      y: 0,
      height: this.height,
      width: this.width,
      name: "frame-background-color"
    });
  }

  drawBackground(): void {
    const element = this._element;
    const options = this._options;

    if (element) {
      const gradientOptions = options.backgroundOptions?.gradient;
      const color = options.backgroundOptions?.color;

      if (!gradientOptions && color === "transparent") {
        return;
      }

      if (gradientOptions || color) {
        this._createColor({
          options: gradientOptions,
          color: color,
          additionalRotation: 0,
          x: options.frameOptions.leftSize || options.frameOptions.xSize || 0,
          y: options.frameOptions.topSize,
          height: this.height - options.frameOptions.topSize - options.frameOptions.bottomSize,
          width: this.width - this.xPadding,
          name: "background-color"
        });
      }
    }
  }

  getXBeginning(count: number, dotSize: number): number {
    const { width, frameOptions } = this._options;
    if (frameOptions.xSize) {
      return Math.floor((width - count * dotSize) / 2);
    }
    const { leftSize = 0, rightSize = 0 } = frameOptions;
    return Math.floor((width - leftSize - rightSize - count * dotSize) / 2) + leftSize;
  }

  drawDots(filter?: FilterFunction): void {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const options = this._options;
    const count = this._qr.getModuleCount();

    if (count > options.width || count > options.height) {
      throw "The canvas is too small.";
    }

    const minSize = Math.min(options.width, options.height) - options.margin * 2 - this.xPadding;
    const dotSize = Math.floor(minSize / count);
    const xBeginning = this.getXBeginning(count, dotSize);
    const yBeginning =
      Math.floor(
        (options.height - options.frameOptions.topSize - options.frameOptions.bottomSize - count * dotSize) / 2
      ) + options.frameOptions.topSize;
    const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

    this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    this._dotsClipPath.setAttribute("id", "clip-path-dot-color");
    this._defs.appendChild(this._dotsClipPath);

    this._createColor({
      options: options.dotsOptions?.gradient,
      color: options.dotsOptions.color,
      additionalRotation: 0,
      x: xBeginning,
      y: yBeginning,
      height: count * dotSize,
      width: count * dotSize,
      name: "dot-color"
    });

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue;
        }
        if (!this._qr?.isDark(i, j)) {
          continue;
        }

        dot.draw({
          x: xBeginning + i * dotSize,
          y: yBeginning + j * dotSize,
          xIndex: i,
          yIndex: j,
          size: dotSize,
          getNeighbor: (xOffset: number, yOffset: number): boolean => {
            if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count) return false;
            if (filter && !filter(i + xOffset, j + yOffset)) return false;
            return !!this._qr && this._qr.isDark(i + xOffset, j + yOffset);
          }
        });

        if (dot._element && this._dotsClipPath) {
          this._dotsClipPath.appendChild(dot._element);
        }
      }
    }
  }

  async drawCorners(): Promise<void> {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const element = this._element;
    const options = this._options;

    if (!element) {
      throw "Element code is not defined";
    }

    const count = this._qr.getModuleCount();
    const minSize = Math.min(options.width, options.height) - options.margin * 2 - this.xPadding;
    const dotSize = Math.floor(minSize / count);
    const cornersSquareSize = dotSize * 7;
    const cornersDotSize = dotSize * 3;
    const xBeginning = this.getXBeginning(count, dotSize);
    const yBeginning =
      Math.floor(
        (options.height - options.frameOptions.topSize - options.frameOptions.bottomSize - count * dotSize) / 2
      ) + options.frameOptions.topSize;

    await Promise.all([
      QRCornerSquare.loadPath(options.cornersSquareOptions?.type),
      QRCornerDot.loadPath(options.cornersDotOptions?.type)
    ]);

    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([column, row, rotation], cornerIndex) => {
      const x = xBeginning + column * dotSize * (count - 7);
      const y = yBeginning + row * dotSize * (count - 7);
      let cornersSquareClipPath = this._dotsClipPath;
      let cornersDotClipPath = this._dotsClipPath;

      if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
        cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        cornersSquareClipPath.setAttribute("id", `clip-path-corners-square-color-${column}-${row}`);
        this._defs.appendChild(cornersSquareClipPath);
        this._cornersSquareClipPath = this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;

        this._createColor({
          options: options.cornersSquareOptions?.gradient,
          color: options.cornersSquareOptions?.color,
          additionalRotation: rotation,
          x,
          y,
          height: cornersSquareSize,
          width: cornersSquareSize,
          name: `corners-square-color-${column}-${row}`
        });
      }

      if (options.cornersSquareOptions?.type) {
        const cornersSquare = new QRCornerSquare({ svg: this._element, type: options.cornersSquareOptions.type });

        cornersSquare.draw(x, y, cornersSquareSize, rotation);

        if (cornersSquare._element && cornersSquareClipPath) {
          cornersSquareClipPath.appendChild(cornersSquare._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }

            dot.draw({
              x: x + i * dotSize,
              y: y + j * dotSize,
              xIndex: i,
              yIndex: j,
              size: dotSize,
              cornerIndex: cornerIndex + 1,
              getNeighbor: (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
            });

            if (dot._element && cornersSquareClipPath) {
              cornersSquareClipPath.appendChild(dot._element);
            }
          }
        }
      }

      if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
        cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        cornersDotClipPath.setAttribute("id", `clip-path-corners-dot-color-${column}-${row}`);
        this._defs.appendChild(cornersDotClipPath);
        this._cornersDotClipPath = cornersDotClipPath;

        this._createColor({
          options: options.cornersDotOptions?.gradient,
          color: options.cornersDotOptions?.color,
          additionalRotation: rotation,
          x: x + dotSize * 2,
          y: y + dotSize * 2,
          height: cornersDotSize,
          width: cornersDotSize,
          name: `corners-dot-color-${column}-${row}`
        });
      }

      if (options.cornersDotOptions?.type) {
        const cornersDot = new QRCornerDot({ svg: this._element, type: options.cornersDotOptions.type });

        cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);

        if (cornersDot._element && cornersDotClipPath) {
          cornersDotClipPath.appendChild(cornersDot._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }

            dot.draw({
              x: x + i * dotSize,
              y: y + j * dotSize,
              xIndex: i,
              yIndex: j,
              size: dotSize,
              // square corners range from 0 to 3 and dot corners from 4 to 6
              cornerIndex: cornerIndex + 4,
              getNeighbor: (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
            });

            if (dot._element && cornersDotClipPath) {
              cornersDotClipPath.appendChild(dot._element);
            }
          }
        }
      }
    });
  }

  async loadSvgImage(src: string): Promise<void> {
    const res = await fetch(src);
    const svgImage = await res.text();
    const container = document.createElement("div");
    container.style.visibility = "hidden";
    container.innerHTML = svgImage;
    this._svgImageElement = container.querySelector("svg") as SVGSVGElement;

    document.body.appendChild(container);
    const { width, height } = this._svgImageElement.getBBox();
    this._svgImageWidth = width;
    this._svgImageHeight = height;

    container.remove();
  }

  loadImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options = this._options;
      const image = new Image();

      if (!options.image) {
        return reject("Image is not defined");
      }

      if (typeof options.imageOptions.crossOrigin === "string") {
        image.crossOrigin = options.imageOptions.crossOrigin;
      }

      if (options.image.slice(-4) === ".svg") {
        this.loadSvgImage(options.image)
          .then(resolve)
          .catch(() => {
            reject(new Error(`SVG image load error - src: ${options.image}`));
          });

        return;
      }

      this._image = image;
      image.onload = (): void => {
        resolve();
      };
      image.onerror = () => {
        reject(new Error(`Image load error - src: ${options.image}`));
      };
      image.src = options.image;
    });
  }

  drawImage({
    width,
    height,
    count,
    dotSize
  }: {
    width: number;
    height: number;
    count: number;
    dotSize: number;
  }): void {
    if (!this._image && !this._svgImageElement) {
      throw "image is not defined";
    }

    const options = this._options;
    let xBeginning = Math.floor((options.width - count * dotSize) / 2);
    if (options.frameOptions.leftSize) {
      xBeginning = Math.floor((this._baseWidth - count * dotSize) / 2 + options.frameOptions.leftSize);
    }

    const yBeginning =
      Math.floor(
        (options.height - options.frameOptions.topSize - options.frameOptions.bottomSize - count * dotSize) / 2
      ) + options.frameOptions.topSize;
    const dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
    const dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
    const dw = width - options.imageOptions.margin * 2;
    const dh = height - options.imageOptions.margin * 2;
    let image = null;
    if (this._svgImageElement) {
      image = this._svgImageElement;
      image.setAttribute("x", String(dx));
      image.setAttribute("y", String(dy));
      image.setAttribute("width", `${dw}px`);
      image.setAttribute("height", `${dh}px`);
    } else {
      image = document.createElementNS("http://www.w3.org/2000/svg", "image");
      image.setAttribute("href", options.image || "");
      image.setAttribute("x", String(dx));
      image.setAttribute("y", String(dy));
      image.setAttribute("width", `${dw}px`);
      image.setAttribute("height", `${dh}px`);
    }

    this._element.appendChild(image);
  }

  _createColor({
    options,
    color,
    additionalRotation,
    x,
    y,
    height,
    width,
    name
  }: {
    options?: Gradient;
    color?: string;
    additionalRotation: number;
    x: number;
    y: number;
    height: number;
    width: number;
    name: string;
  }): void {
    const size = width > height ? width : height;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("height", String(height));
    rect.setAttribute("width", String(width));
    rect.setAttribute("clip-path", `url('#clip-path-${name}')`);

    if (options) {
      let gradient: SVGElement;
      if (options.type === gradientTypes.radial) {
        gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        gradient.setAttribute("id", name);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("fx", String(x + width / 2));
        gradient.setAttribute("fy", String(y + height / 2));
        gradient.setAttribute("cx", String(x + width / 2));
        gradient.setAttribute("cy", String(y + height / 2));
        gradient.setAttribute("r", String(size / 2));
      } else {
        const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
        const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
        let x0 = x + width / 2;
        let y0 = y + height / 2;
        let x1 = x + width / 2;
        let y1 = y + height / 2;

        if (
          (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
          (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
        ) {
          x0 = x0 - width / 2;
          y0 = y0 - (height / 2) * Math.tan(rotation);
          x1 = x1 + width / 2;
          y1 = y1 + (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
          y0 = y0 - height / 2;
          x0 = x0 - width / 2 / Math.tan(rotation);
          y1 = y1 + height / 2;
          x1 = x1 + width / 2 / Math.tan(rotation);
        } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
          x0 = x0 + width / 2;
          y0 = y0 + (height / 2) * Math.tan(rotation);
          x1 = x1 - width / 2;
          y1 = y1 - (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
          y0 = y0 + height / 2;
          x0 = x0 + width / 2 / Math.tan(rotation);
          y1 = y1 - height / 2;
          x1 = x1 - width / 2 / Math.tan(rotation);
        }

        gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", name);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("x1", String(Math.round(x0)));
        gradient.setAttribute("y1", String(Math.round(y0)));
        gradient.setAttribute("x2", String(Math.round(x1)));
        gradient.setAttribute("y2", String(Math.round(y1)));
      }

      options.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", `${100 * offset}%`);
        stop.setAttribute("stop-color", color);
        gradient.appendChild(stop);
      });

      rect.setAttribute("fill", `url('#${name}')`);
      this._defs.appendChild(gradient);
    } else if (color) {
      rect.setAttribute("fill", color);
    }

    this._element.appendChild(rect);
  }
}
