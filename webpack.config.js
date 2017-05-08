const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./src/NotificationsWidget/widget/NotificationsWidget.js",
    output: {
        path: __dirname + "/dist/tmp",
        filename: "src/NotificationsWidget/widget/Notifications.js",
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            }) },
            { test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
        ]
    },
    devtool: "source-map",
    externals: [ /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin("./src/NotificationsWidget/widget/ui/NotificationsWidget.css"),
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ]
};
