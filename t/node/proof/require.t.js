#!/usr/bin/env node

require('../../..')(1, function (assert) {
    assert(require('../../../proof').main, 'require')
})
