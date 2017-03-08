var ConditionalExternalPlugin = require('../plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    plugins: [
      new ConditionalExternalPlugin()
    ]
};
