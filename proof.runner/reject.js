module.exports = function (ee) {
    ee.on('unhandledRejection', error => {
  throw error /*\*-* Proof framework rewthrowing test generated error. See below. *-*\*/
    })
}
