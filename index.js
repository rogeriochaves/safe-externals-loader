var path = require("path");

module.exports = function (source) {
  this.cacheable();

  var externals = JSON.parse(this.query.split('?')[1]);
  var isTheEntryPoint = this._module.userRequest === findEntry(this._module);

  var updatedSource = replaceRequiresWithGlobals(externals, source);

  if (isTheEntryPoint) {
    return addExternalRequires(externals, updatedSource);
  }
  return updatedSource;
};

var findEntry = function (module) {
  if (module.reasons.length > 0) {
    return findEntry(module.reasons[0].module);
  }
  return module.resource;
};

var replaceRequiresWithGlobals = function (externals, source) {
  return Object.keys(externals).reduce(function (source, external) {
    var regex = new RegExp('((var|let|const)[\\s\\S]+?=[\\s\\S]+?)require\\([\'"`]' + external + '[\'"`]\\)', 'g');

    var windowName = externals[external];
    return source.replace(regex, "$1window['" + windowName[0] + "']");
  }, source);
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
    var windowName = externals[external];

    return "\
      if (!window['" + windowName[0] + "']) \
        imports.push( \
          System.import('" + external + "').then( \
            function (result) { \
              window['" + windowName[0] + "'] = result; \
            } \
          ) \
        ); \
    "
  }).join('\n');
};
