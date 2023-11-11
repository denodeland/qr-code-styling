import qrTypes from "../constants/qrTypes";
import drawTypes from "../constants/drawTypes";
import errorCorrectionLevels from "../constants/errorCorrectionLevels";
import {
  DotType,
  GradientType,
  CornerSquareType,
  CornerDotType,
  TypeNumber,
  ErrorCorrectionLevel,
  Mode,
  DrawType
} from "../types";

export type Gradient = {
  type: GradientType;
  rotation?: number;
  colorStops: {
    offset: number;
    color: string;
  }[];
};

export type Options = {
  width?: number;
  height?: number;
  data?: string;
  image?: string;
  qrOptions?: {
    typeNumber?: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    crossOrigin?: string;
    margin?: number;
  };
  dotsOptions?: {
    type?: DotType;
    color?: string;
    gradient?: Gradient;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
    gradient?: Gradient;
  };
  cornersDotOptions?: {
    type?: CornerDotType;
    color?: string;
    gradient?: Gradient;
  };
  backgroundOptions?: {
    color?: string;
    gradient?: Gradient;
  };
  margin?: number;
  borderRadius?: number;
  offscreen?: boolean;
  frameOptions?: FrameOptions;
};

export interface FrameOptions {
  xSize: number;
  leftSize: number;
  rightSize: number;
  topSize: number;
  bottomSize: number;
  image: string;
  background: {
    color: string;
    gradient?: Gradient;
  };
  svgContent: string;
  svgWidth: number;
  svgHeight: number;
}

export interface RequiredOptions extends Options {
  type: DrawType;
  width: number;
  height: number;
  margin: number;
  borderRadius: number;
  data: string;
  offscreen: boolean;
  qrOptions: {
    typeNumber: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    crossOrigin?: string;
    margin: number;
  };
  dotsOptions: {
    type: DotType;
    color: string;
    gradient?: Gradient;
  };
  backgroundOptions: {
    color: string;
    gradient?: Gradient;
  };
  frameOptions: FrameOptions;
}

const defaultOptions: RequiredOptions = {
  type: drawTypes.canvas,
  width: 300,
  height: 300,
  data: "",
  margin: 0,
  borderRadius: 0,
  offscreen: false,
  qrOptions: {
    typeNumber: qrTypes[0],
    mode: undefined,
    errorCorrectionLevel: errorCorrectionLevels.Q
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    crossOrigin: undefined,
    margin: 0
  },
  dotsOptions: {
    type: "square",
    color: "#000"
  },
  backgroundOptions: {
    color: "#fff"
  },
  frameOptions: {
    xSize: 0,
    leftSize: 0,
    rightSize: 0,
    topSize: 0,
    bottomSize: 0,
    image: "",
    background: {
      color: ""
    },
    svgContent: "",
    svgWidth: 0,
    svgHeight: 0
  }
};

export default defaultOptions;

export interface CreateGradientOptions {
  context: CanvasRenderingContext2D;
  options: Gradient;
  additionalRotation: number;
  x: number;
  y: number;
  width: number;
  height?: number;
}

export interface SetColorOptions extends Omit<CreateGradientOptions, "options"> {
  color?: string;
  options?: Gradient;
  stroke?: boolean;
}
