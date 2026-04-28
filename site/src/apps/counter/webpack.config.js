const path = require("path");

const config = {
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "../../../public/apps/counter"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};

module.exports = function () {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true,
    };
  } else {
    config.devtool = "eval-source-map";
    // config.devtool = "inline-source-map";
  }
  return config;
};
