const { expect } = require('chai');
const jsBeautify = require('js-beautify');
const loader = require('../index');

describe('Safe Externals Loader', () => {
  let webpackLoaderApiMock;
  beforeEach(function () {
    webpackLoaderApiMock = {
      cacheable: () => {},
      _module: { rawRequest: './foo.js' },
      query: '?' + JSON.stringify({jquery: ['jQuery']}),
      options: {
        entry: './baz.js'
      }
    };
  });

  describe('replacing requires with window', () => {
    it('replaces requires to externals with window external objects', () => {
      const fixture = "var $ = require('jquery');";
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(result).to.equal("var $ = window['jQuery'];");
    });

    it('replaces requires multiples requires with multiple window object names', () => {
      const fixture = `
        var $ = require('jquery');
        var react = require('react');
      `;
      webpackLoaderApiMock.query = '?' + JSON.stringify({
        jquery: ['jQuery'],
        react: ['react']
      });
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(result).to.equal(`
        var $ = window['jQuery'];
        var react = window['react'];
      `);
    });

    it('replaces requires with multiple window object names', () => {
      const fixture = `
        var $ = require('jquery');
        var react = require('react');
      `;
      webpackLoaderApiMock.query = '?' + JSON.stringify({
        jquery: ['jQuery', '$'],
        react: ['react']
      });
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(result).to.equal(`
        var $ = window['jQuery'] || window['$'];
        var react = window['react'];
      `);
    });
  });

  describe('imports on the entry file', () => {
    const fixture = "console.log('foo');";
    beforeEach(() => {
      webpackLoaderApiMock.options.entry = './foo.js';
    });

    it('adds imports to an external if it is not available', () => {
      const expected = `
        var imports = [];
        if (!(window['jQuery'])) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; }));
        Promise.all(imports).then(function () {
          console.log('foo');
        });
      `;
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(jsBeautify(result)).to.equal(jsBeautify(expected));
    });

    it('adds imports to multiple externals if they are not available', () => {
      webpackLoaderApiMock.query = '?' + JSON.stringify({
        jquery: ['jQuery'],
        react: ['react']
      });
      const expected = `
        var imports = [];
        if (!(window['jQuery'])) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; }));
        if (!(window['react'])) imports.push(System.import('react').then(function (result) { window['react'] = result; }));
        Promise.all(imports).then(function () {
          console.log('foo');
        });
      `;
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(jsBeautify(result)).to.equal(jsBeautify(expected));
    });

    it('adds imports to multiple externals if they are not available in multiple window names', () => {
      webpackLoaderApiMock.query = '?' + JSON.stringify({
        jquery: ['jQuery', '$'],
        react: ['react']
      });
      const expected = `
        var imports = [];
        if (!(window['jQuery'] || window['$'])) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; window['$'] = result; }));
        if (!(window['react'])) imports.push(System.import('react').then(function (result) { window['react'] = result; }));
        Promise.all(imports).then(function () {
          console.log('foo');
        });
      `;
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(jsBeautify(result)).to.equal(jsBeautify(expected));
    });

    it('process corrently for entry point for entry points with multiple files', () => {
      webpackLoaderApiMock.options.entry = ['./foo.js', './bar.js'];
      const expected = `
        var imports = [];
        if (!(window['jQuery'])) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; }));
        Promise.all(imports).then(function () {
          console.log('foo');
        });
      `;
      const result = loader.call(webpackLoaderApiMock, fixture);

      expect(jsBeautify(result)).to.equal(jsBeautify(expected));
    });
  });
});
