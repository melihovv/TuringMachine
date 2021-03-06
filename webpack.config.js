module.exports = {
    entry: {
        app: './public/js/index',
        test: './test/TuringMachineSpec'
    },
    output: {
        path: './public/js',
        filename: '[name].bundle.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
};
