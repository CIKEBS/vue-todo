const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const isDev = process.env.NODE_ENV === 'development'
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')

const config = {
    target:'web',
    entry : path.join(__dirname,'src/index.js'),
    output:{
        filename: 'bound.[hash:8].js',
        path: path.join(__dirname,'dist')
    },
    module: {
      rules: [
        {
            test:/\.vue$/,
            loader: 'vue-loader'
        },
        {
            test:/\.jsx$/,
            loader: 'babel-loader'
        },
        {
            test:/\.(gif|jpg|jpeg|png|svg)$/,
            use:[
                {
                    loader:'url-loader',
                    options:{
                        limit:1024,
                        name:'[name]-aaa.[ext]'

                    }
                }
            ]
        }  
      ] 
    },
    plugins:[
        //请确保引入这个插件
        new VueLoaderPlugin(),
        //VUE会按照环境区分打包
        new webpack.DefinePlugin({
            //webpack在编译时，以及编码时可以调用的变量
            'process.env':{
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ]
}

if(isDev){
    config.module.rules.push(
        {
            test:/\.styl/,
            use:[
                'style-loader',
                'css-loader',
                {
                    loader:"postcss-loader",
                    //复用stylus的source map
                    options:{
                        sourceMap:true
                    }
                },
                'stylus-loader'
            ]
        }
    )
    //调试配置
    config.devtool = '#cheap-module-eval-source-map'
    //
    config.devServer = {
        port:'8000',
        host:'0.0.0.0',
        overlay: {
            errors: true,
        },
        //启动webpack-dev-server的时候，自动打开浏览器，但是改webpack配置时，每次都会打开一个页面，很烦，按需添加
        open :true,
        //单页应用会有很多前端路由，做前端路由时请求进来的地址不一定是默认的index.html，这个可以对未做映射的地址都映射到index.html上
        // historyFallback:{}

        //热加载
        // hot : true
    } 
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry={
        app:path.join(__dirname,'src/index.js'),
        vender:['vue']
    }
    config.output.filename='[name].[chunkhash:8].js'
    config.module.rules.push(
        {
            test:/\.styl/,
            use:ExtractPlugin.extract({
                fallback:'style-loader',
                use:[
                    'css-loader',
                    {
                        loader:"postcss-loader",
                        //复用stylus的source map
                        options:{
                            sourceMap:true
                        }
                    },
                    'stylus-loader'
                ]
            })
        }
    )
    config.plugins.push(
        new ExtractPlugin('styles.[chunkhash:8].css')
    )
    config.optimization = {
        splitChunks: {
          cacheGroups: {
            commons: {
              chunks: 'initial',
              minChunks: 2, maxInitialRequests: 5,
              minSize: 0
            },
            vendor: {
              test: /node_modules/,
              chunks: 'initial',
              name: 'vendor',
              priority: 10,
              enforce: true
            }
          }
        },
        runtimeChunk: true
      }
}

module.exports = config
