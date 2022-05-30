const path = require("path");

module.exports = {
    mode: 'development',
    devtool: "source-map",
    devServer: {
        host: 'local-ip',
        port: '',
        static: {
            directory: path.join(__dirname, 'static'),
        },
        compress: true,
        host: '127.0.0.1',
        port: 5001,
    },
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "scripts/index.js",
        path: path.resolve(__dirname, "static"),
    }
};
