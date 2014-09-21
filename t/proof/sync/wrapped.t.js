require('./proof')(1, function (assert) {
    assert(this.initialized, 'wrapped')
})
