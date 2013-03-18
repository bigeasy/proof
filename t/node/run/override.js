module.exports = require("../../../lib/proof")(function (equal) {
  return { 
    equal: function (value) {
      return value == "overridden";
    }
  }
});
