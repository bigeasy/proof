module.exports = function (ee) {
    ee.on('unhandledRejection', error => {
  throw error /*\*-* Proof framework rewthrowing unhandled rejection error. See below. *-*\*/
    })
}
