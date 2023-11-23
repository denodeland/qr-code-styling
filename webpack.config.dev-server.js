const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const commonConfig = require("./webpack.config.common.js");

module.exports = merge(
  {
    ...commonConfig,
    module: {
      ...commonConfig.module,
      rules: commonConfig.module.rules.filter((rule) => rule.loader !== "eslint-loader")
    }
  },
  {
    mode: "development",
    devServer: {
      injectClient: false //workaround for bug https://github.com/webpack/webpack-dev-server/issues/2484
    },
    devtool: "inline-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "head",
        scriptLoading: "blocking"
      })
    ],
    output: {
      libraryExport: "default"
    }
  }
);
