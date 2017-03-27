var path = require("path");

module.exports = function (source) {
  this.cacheable();

  var externals = JSON.parse(this.query.split('?')[1]);
  var isTheEntryPoint = this.options.entry.indexOf(this._module.rawRequest) !== -1;

  var updatedSource = replaceRequiresWithGlobals(externals, source);

  if (isTheEntryPoint) {
    return addExternalRequires(externals, updatedSource);
  }
  return updatedSource;
};

var replaceRequiresWithGlobals = function (externals, source) {
  return Object.keys(externals).reduce(function (source, external) {
    var regex = new RegExp('((var|let|const).+?= *)require\\([\'"`]' + external + '[\'"`]\\)', 'g');

    var windowRequires = getFromWindowNames(externals[external]);
    return source.replace(regex, '$1' + windowRequires.replace('$', '$$$$'));
  }, source);
};

var getFromWindowNames = function (windowNames) {
  return windowNames.map(function (windowName) {
    return "window['" + windowName + "']";
  }).join(' || ');
};

var addExternalRequires = function (externals, source) {
  var imports = createImports(externals);
  var requires = "\
var imports = []; \
    " + imports + " \
    Promise.all(imports).then(function () { \
  ";
  var closing = '});';
  return requires + source + closing;
};

var createImports = function (externals) {
  return Object.keys(externals).map(function (external) {
    var windowNames = externals[external];
    var windowRequires = getFromWindowNames(windowNames);
    var windowSets = setWindowNames(windowNames);

    return "\
      if (!("+ windowRequires +")) \
        imports.push( \
          new Promise(function(resolve, reject) { \
            require(['" + external + "'], function (result) { \
              " + windowSets + "; \
              resolve(); \
            }); \
          }) \
        ); \
    "
  }).join('\n');
};

var setWindowNames = function (windowNames) {
  return windowNames.map(function (windowName) {
    return "window['" + windowName + "'] = result";
  }).join(';');
};
