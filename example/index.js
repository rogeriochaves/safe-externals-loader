// var jQuery = require('jquery');
//
// jQuery('#result').html('jQuery is working!');

/* parsed */

(function (callback) { window['jQuery'] ? callback(window['jQuery']) : require(['jquery'], callback); })(function (jQuery) {
  jQuery('#result').html('jQuery is working!');
});
