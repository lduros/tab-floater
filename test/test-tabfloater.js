/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Ci, Cc } = require('chrome');

const self = require('self');
const timer = require('timer');
const { Loader } = require('sdk/test/loader');

exports["test TabFloater"] = function (assert, done) {
  const { TabFloater } = require('tab-floater');
  let floater = TabFloater({
    contentURL: "about:buildconfig",
    contentScript: "self.postMessage(1); self.on('message', function() self.postMessage(2));",
    onMessage: function (message) {
      assert.equal(this, floater, "The 'this' object is the floater.");
      switch(message) {
       case 1:
       assert.pass("The panel was loaded.");
       floater.postMessage('');
       break;
       case 2:
       assert.pass("The panel posted a message and received a response.");
       floater.destroy();
       done();
       break;
       }
    }
  });
};

require("test").run(exports);