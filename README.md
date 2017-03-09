Safe Externals Loader for Webpack
=================================

Load webpack externals only if they are available globally, else require them

# Usage example:

```javascript
const safeExternals = {
  jquery: ['jQuery', '$'],
  react: ['React']
};

module.exports = {
  entry: './index.js',
  output: {
      path: __dirname,
      filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'safe-externals-loader',
      query: JSON.stringify(safeExternals)
    }]
  }
};
```
