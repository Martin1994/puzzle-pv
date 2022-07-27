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
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ]
            }
        ],
    },
    externals: [
        'child_process'
    ],
    externalsType: 'commonjs',
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "scripts/index.js",
        path: path.resolve(__dirname, "static"),
    },
    optimization: {
        usedExports: true,
        minimize: true
    }
};
