const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const publicPath = 'images/';

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: isProd,
    allChunks: true

});
const extractHtml = new htmlWebpackPlugin({
	title: 'Map App',
	minify:{
		collapseWhitespace: true
	},
	hash: true,
	template: './src/index.html' // Load a custom template (ejs by default see the FAQ for details)
});

var isProd  = process.env.NODE_ENV === 'production', // this will return true or false depend on package.json
    cssDev  = ["style-loader","css-loader","sass-loader"],
    cssProd = extractSass.extract({
        use:[{
                loader: "css-loader", // translates SASS into Common CSS
                options: {sourceMap: true, convertToAbsoluteUrls: true } // convertTo.. will resolve images path
            }, {
                loader: "sass-loader"
            }],
        fallback: "style-loader"
    });
var cssConfig = isProd ? cssProd: cssDev;

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        stats: "errors-only",
        watchContentBase: true,
        hot: true,
        open: true,
        port: 9000
    },
    devtool: "source-map", // show .map files for better debugging.
    entry: {
        app: './src/app.ts',
    },
    output:{
        path: __dirname + '/src/dist',
        filename: 'app.bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css']
    },
    module:{
        rules: 
        [{ // regular css files
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                loader: 'css-loader?importLoaders=1'
            })
        },{   
            test: /\.(sass|scss)$/, 
            use: cssConfig
        },{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.(png|jpe?g|gif|svg|)$/i,
            loader: [
                'file-loader?name='+publicPath+'[name].[ext]',
                {
                    loader: 'image-webpack-loader',
                    options: 
                    {
                        query: 
                        {
                            progressive: true,
                            optimizationLevel: 7,
                            interlaced: false,
                            pngquant:
                            {
                                quality: '65-90',
                                speed: 4
                            }
                        }
                    }
                }
            ]
        }]
    },
    plugins: [
        extractHtml,
        extractSass,
        new webpack.ProvidePlugin({ // inject ES5 modules as global vars
            $: 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default']
        }),
        new CleanWebpackPlugin(['src/dist']),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ]
}