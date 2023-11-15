import QRCodeStyling from "./core/QRCodeStyling";
import dotPaths from "./figures/dot/paths";
import cornerSquarePaths, { lazyPaths as cornerSquareLazyPaths } from "./figures/cornerSquare/paths";
import cornerDotPaths, { lazyPaths as cornerDotLazyPaths } from "./figures/cornerDot/paths";
import dotTypes from "./constants/dotTypes";
import cornerDotTypes from "./constants/cornerDotTypes";
import cornerSquareTypes from "./constants/cornerSquareTypes";
import errorCorrectionLevels from "./constants/errorCorrectionLevels";
import errorCorrectionPercents from "./constants/errorCorrectionPercents";
import modes from "./constants/modes";
import qrTypes from "./constants/qrTypes";
import drawTypes from "./constants/drawTypes";

export {
  dotTypes,
  cornerDotTypes,
  cornerSquareTypes,
  errorCorrectionLevels,
  errorCorrectionPercents,
  modes,
  qrTypes,
  drawTypes,
  cornerSquarePaths,
  cornerSquareLazyPaths,
  cornerDotPaths,
  cornerDotLazyPaths,
  dotPaths
};
export default QRCodeStyling;
