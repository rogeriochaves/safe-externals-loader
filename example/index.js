var secondDependency = require('./secondDependency');
var jQuery = require('jquery');
var React = require('react');

secondDependency();

console.log('jquery being used:', jQuery);
console.log('react being used:', React);
