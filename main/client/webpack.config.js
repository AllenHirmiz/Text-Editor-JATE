const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");
const { InjectManifest } = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// TODO: Add and configure workbox plugins for a service worker and manifest file.
// TODO: Add CSS loaders and babel to webpack.

module.exports = (env, argv) => {
  const injectManifest = new InjectManifest({
    swSrc: "./src-sw.js",
    swDest: "src-sw.js",
    ...(argv.mode !== "production" ? { exclude: [/./] } : {}),
  });

  if (argv.mode !== "production") {
    // In dev, suppress the "InjectManifest has been called multiple times" warning by reaching into
    // the private properties of the plugin and making sure it never ends up in the state
    // where it makes that warning.
    Object.defineProperty(injectManifest, "alreadyCalled", {
      get() {
        return false;
      },
      set() {
        // do nothing; the internals try to set it to true, which then results in a warning
        // on the next run of webpack.
      },
    });
  }

  return {
    mode: "development",
    entry: {
      // Entry point for files
      main: "./src/js/index.js",
      install: "./src/js/install.js",
      // editor: './src/editor.js'
    },
    output: {
      // Output for our bundles
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        // Webpack plugin that generates our html file and injects our bundles.
        template: "./index.html",
        title: "J.A.T.E",
      }),

      injectManifest,

      new WebpackPwaManifest({
        // Creates a manifest.json file.
        fingerprints: false,
        inject: true,
        name: "Just Another Text Editor",
        short_name: "J.A.T.E.",
        description:
          "Create notes and code snippets with or without an internet connection.",
        background_color: "#f5f5f5",
        theme_color: "#31a9e1",
        start_url: "./",
        publicPath: "./",
        icons: [
          {
            src: path.resolve("src/images/logo.png"),
            sizes: 96,
            destination: path.join("assets", "icons"),
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],

    module: {
      rules: [
        // CSS loaders
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                "@babel/plugin-proposal-object-rest-spread",
                "@babel/transform-runtime",
              ],
            },
          },
        },
      ],
    },
  };
};
