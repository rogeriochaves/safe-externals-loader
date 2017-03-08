module.exports = function (aliases, callback) {
  var globalAlias = aliases.find(function (alias) {
    return window[alias];
  });
  if (globalAlias) {
    callback(window[globalAlias]);
  } else {
    require(['jquery'], callback);
  }
};
