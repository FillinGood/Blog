const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src\\index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '..', 'static')
  },
  devServer: {
    port: 8050,
    proxy: {
      '/api': {
        target: 'http://localhost:8080'
      }
    },
    static: {
      directory: path.resolve(__dirname, '..', 'static')
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    historyApiFallback: true
  }
};
