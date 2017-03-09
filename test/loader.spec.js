const { expect } = require('chai');
const jsBeautify = require('js-beautify');
const loader = require('../index');

describe('Safe Externals Loader', () => {
  let webpackLoaderApiMock = {
    cacheable: () => {},
    _module: { userRequest: 'foo', reasons: [], resource: 'bar' }
  };

  it('replaces requires to jquery with window jquery object', () => {
    const fixture = "var $ = require('jquery');";
    const result = loader.call(webpackLoaderApiMock, fixture);

    expect(result).to.equal("var $ = window['jQuery'];");
  });

  it('adds imports to jquery if global jquery is not available', () => {
    const fixture = "console.log('foo');";
    webpackLoaderApiMock._module.userRequest = 'index';
    webpackLoaderApiMock._module.reasons = [{
      module: {
        reasons: [],
        resource: 'index'
      }
    }];
    const expected = `
      var imports = [];
      if (!window['jQuery']) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; }));

      Promise.all(imports).then(function () {
        console.log('foo');
      });
    `;
    const result = loader.call(webpackLoaderApiMock, fixture);

    expect(jsBeautify(result)).to.equal(jsBeautify(expected));
  });
});
