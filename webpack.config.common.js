const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "lib");

module.exports = {
  entry: srcPath + "/index.ts",
  output: {
    path: libPath,
    filename: "qr-code-styling.js",
    library: "QRCodeStyling",
    libraryTarget: "umd",
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/
      },
      {
        enforce: "pre",
        test: /\.ts$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: "worker-loader",
            options: { filename: "[name].[chunkhash].js" }
          },
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  plugins: [new CleanWebpackPlugin()],
  resolve: {
    extensions: [".ts", ".js"]
  }
};
