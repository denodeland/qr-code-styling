import qrcode from "qrcode-generator";
import QRCanvas from "./core/QRCanvas";
import getMode from "./tools/getMode";

const workerCtx: Worker = self as any;

// Respond to message from parent thread
workerCtx.addEventListener("message", async ({ data }) => {
  if (data.key === "initCanvas") {
    const { options, frameImage, id } = data;

    const canvas = new QRCanvas(data.options, data.canvas, frameImage);

    const qr = qrcode(options.qrOptions.typeNumber, options.qrOptions.errorCorrectionLevel);
    qr.addData(options.data, options.qrOptions.mode || getMode(options.data));
    qr.make();

    await canvas.drawQR(qr);

    workerCtx.postMessage({ key: "drawingEnded", id });
  }
});

export default {} as typeof Worker & { new (): Worker };
