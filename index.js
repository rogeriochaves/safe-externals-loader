var path = require("path");

module.exports = function (source) {
  this.cacheable();

  var isTheEntryPoint = this._module.userRequest === findEntry(this._module);

  var updatedSource = replaceRequiresWithGlobals(source);

  if (isTheEntryPoint) {
    return addExternalRequires(updatedSource);
  }
  return updatedSource;
};

var findEntry = function (module) {
  if (module.reasons.length > 0) {
    return findEntry(module.reasons[0].module);
  }
  return module.resource;
};

var replaceRequiresWithGlobals = function (source) {
  var regex = /((var|let|const)[\s\S]+?=[\s\S]+?)require\(['"`]jquery['"`]\)/;
  return source.replace(regex, "$1window['jQuery']");
};

var addExternalRequires = function (source) {
  var requires = `
    var imports = [];
    if (!window['jQuery']) imports.push(System.import('jquery').then(function (result) { window['jQuery'] = result; }));

    Promise.all(imports).then(function () {
  `;
  var closing = '});';
  return requires + source + closing;
};
