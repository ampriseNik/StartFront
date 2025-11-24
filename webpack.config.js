/* eslint-disable */
/**
* Webpack main configuration file
*/

const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var wp = false;
const environment = require('./configuration/environment');
if(process.env.npm_lifecycle_event === 'production') {  
  environment.paths.output = environment.paths.product;
}

if(process.env.npm_lifecycle_event === 'wp'
|| process.env.npm_lifecycle_event === 'wp_debug') {  
  environment.paths.output = environment.paths.wp;
  wp = true;
} 

var entries = {
  app: path.resolve(environment.paths.source, 'js', 'app.js'),
};

const templateFiles = fs.readdirSync(environment.paths.source)
  .filter((file) => ['.html', '.ejs'].includes(path.extname(file).toLowerCase())).map((filename) => ({
    input: filename,
    output: wp ? '/html-maket/' + filename.replace(/\.ejs$/, '.html') : filename.replace(/\.ejs$/, '.html'),
	inject: true,
  }));

const htmlPluginEntries = templateFiles.map((template) => {
	let p = path.parse(template.output).base.replace(/\.html$/, '');
	let ch = ['app', 'fonts'];
	try {
    let pt = path.resolve(environment.paths.source, 'js', p + '.js');
	  if (fs.existsSync(pt)) {
      entries[p] = pt;
      ch = ['app', 'fonts', p];
	  }
	} catch(err) {}
	return new HTMLWebpackPlugin({
        inject: template.inject,
        hash: false,
        filename: template.output,
        template: path.resolve(environment.paths.source, template.input),
        chunks: ch
    });
});

module.exports = {
  entry: entries,
  output: {
    filename: wp ? 'js/[name].js' : 'src/js/[name][hash].js',
    path: environment.paths.output,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: {
                list: [
                  {
                    tag: 'script',
                    attribute: 'src',
                    type: 'src',
                    filter: (tag, attribute, attributes) => {
                      return false;
                    }
                  }
                ]
              }
            }
          },
          './transform/customTags.js'
        ]
      },
      {
        test: /\.((c|sa|sc)ss)$/,
        use: [
          MiniCssExtractPlugin.loader, 
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          }, 
          'postcss-loader', 
          'sass-loader'
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|gif|jpe?g|svg|ico|mp4)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 0,
          },
        },
        generator: {
          filename: '[path][name][ext]', //wp ? 'assets/images/design/[name].[ext]' :
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 0,
          },
        },
        generator: {
          filename: wp ? 'assets/images/design/[name].[ext]' : 'src/assets/images/design/[name][ext]',
        },
      },
      {
        test: /\.(webmanifest|xml)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 0,
          },
        },
        generator: {
          filename: wp ? 'assets/images/design/[name].[ext]' : 'src/assets/images/design/[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: wp ? 'css/[name].css' : 'src/css/[name][hash].css',
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json'],
    }),
    new CopyWebpackPlugin({
      patterns: wp 
      ? [{
        from: path.resolve(environment.paths.source, 'assets'),
        to: path.resolve(environment.paths.output, 'assets'),
        noErrorOnMissing: true,
        globOptions: {
          ignore: ['*.DS_Store', 'Thumbs.db'],
        },
      },
	  {
        from: path.resolve(environment.paths.source, '*.php'),
        to: path.resolve(environment.paths.output),
        noErrorOnMissing: true,
	  },  
      {
        from: path.resolve(environment.paths.source, 'fonts'),
        to: path.resolve(environment.paths.output, 'fonts'),
        noErrorOnMissing: true,
        globOptions: {
          ignore: ['*.DS_Store', 'Thumbs.db'],
        },
      },
	  {
        from: path.resolve(environment.paths.source, 'lib'),
        to: path.resolve(environment.paths.output, 'lib'),
        noErrorOnMissing: true,
        globOptions: {
          ignore: ['*.DS_Store', 'Thumbs.db'],
        },
      },] 
      : [
        {
          from: path.resolve(environment.paths.source, 'favicon.ico'),
          to: path.resolve(environment.paths.output, 'favicon.ico'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
        {
          from: path.resolve(environment.paths.source, 'assets'),
          to: path.resolve(environment.paths.output, 'src', 'assets'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
        {
          from: path.resolve(environment.paths.source, 'trash'),
          to: path.resolve(environment.paths.output, 'src', 'trash'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
        {
          from: path.resolve(environment.paths.source, 'get_ajax_data'),
          to: path.resolve(environment.paths.output, 'get_ajax_data'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
        {
          from: path.resolve(environment.paths.source, 'fonts'),
          to: path.resolve(environment.paths.output, 'src', 'fonts'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
		{
          from: path.resolve(environment.paths.source, 'lib'),
          to: path.resolve(environment.paths.output, 'src', 'lib'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['*.DS_Store', 'Thumbs.db'],
          },
        },
      ],
    }),
  ].concat(htmlPluginEntries),
  target: 'web',
};
