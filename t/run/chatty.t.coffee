#!/usr/bin/env coffee

test = require "../../lib/ace"

test 1, ->
  console.error "Test initated. Initial status go."
  console.error "Preparing first assertion, entering truth testing phase."
  console.error "Initating assertion sequence."
  console.error { sequence: 1, confirmation: "Roger Victor X-Ray Niner" }
  console.error "Test follows."
  @ok true, "test truth"
  console.log "# The value of true appears to be true."
  console.log "# Please write a test for this test to ensure that it is correct."
  console.error "Test complete."
  console.error "Assertion sequence wind down."
  console.error "Program termination sequence begins."
