module.exports = require("../../..")(function (equal) {
  return {
    equal: function (value, message) {
      equal(value, "overridden", message);
    }
  }
});
