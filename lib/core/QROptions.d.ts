import { DotType, GradientType, CornerSquareType, CornerDotType, TypeNumber, ErrorCorrectionLevel, Mode } from "../types";
export declare type Gradient = {
    type: GradientType;
    rotation?: number;
    colorStops: {
        offset: number;
        color: string;
    }[];
};
export declare type Options = {
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
    xSize?: number;
    leftSize?: number;
    rightSize?: number;
    topSize: number;
    bottomSize: number;
    image: string;
    background: {
        color: string;
        gradient?: Gradient;
    };
}
export interface RequiredOptions extends Options {
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
declare const defaultOptions: RequiredOptions;
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
