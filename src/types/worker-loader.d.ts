declare let __webpack_public_path__: string;

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
