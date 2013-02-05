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

exports["test TabFloater Emit"] = function(assert, done) {
  const { TabFloater } = require('tab-floater');

  let floater = TabFloater({
    contentURL: "about:buildconfig",
    contentScript: "self.port.emit('loaded');" +
                   "self.port.on('addon-to-content', " +
                   "             function() self.port.emit('received'));"
  });
  floater.port.on("loaded", function () {
    assert.pass("The panel was loaded and sent a first event.");
    floater.port.emit("addon-to-content");
  });
  floater.port.on("received", function () {
    assert.pass("The panel posted a message and received a response.");
    floater.destroy();
    done();
  });
};

exports["test TabFloater Emit Early"] = function(assert, done) {
  const { TabFloater } = require('tab-floater');

  let tabFloater = TabFloater({
    contentURL: "about:buildconfig",
    contentScript: "self.port.on('addon-to-content', " +
                   "             function() self.port.emit('received'));",
  });
  tabFloater.port.on("received", function () {
    assert.pass("The tabFloater posted a message early and received a response.");
    tabFloater.destroy();
    done();
  });
  tabFloater.port.emit("addon-to-content");
};

exports["test Show Hide TabFloater"] = function(assert, done) {
  const { TabFloater } = require('tab-floater');
  let tabFloater;
  tabFloater = TabFloater({
    contentScript: "self.postMessage('')",
    contentScriptWhen: "end",
    contentURL: "data:text/html;charset=utf-8,",
    onMessage: function (message) {
      assert.equal(this, tabFloater, "The 'this' object is the tabFloater.");
      tabFloater.show();
      console.log("running");
    },
    onShow: function () {
      assert.pass("The tabFloater was shown.");
      
      assert.equal(this, tabFloater, "The 'this' object is the tabFloater.");

      tabFloater.hide();
    },
    onHide: function () {
      assert.pass("The tabFloater was hidden.");
      assert.equal(this, tabFloater, "The 'this' object is the tabFloater.");
      tabFloater.destroy();
      done();
    }
  });

};


require("test").run(exports);