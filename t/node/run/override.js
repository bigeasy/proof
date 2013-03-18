module.exports = require("../../../lib/proof")(function (equal) {
  return { 
    equal: function (value, message) {
      equal(value, "overridden", message);
    }
  }
});
