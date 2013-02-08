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

  let tabFloater = TabFloater({
    contentScript: "self.postMessage('')",
    contentScriptWhen: "end",
    contentURL: "data:text/html;charset=utf-8,",
    onMessage: function (message) {
      assert.equal(this.toString(), tabFloater, "The 'this' object is the tabFloater.");
      console.log("running");
      tabFloater.show();
    },
    onShow: function () {
      assert.pass("The tabFloater was shown.");
      assert.equal(this.toString(), tabFloater, "The 'this' object is the tabFloater.");
      tabFloater.hide();
    },
    onHide: function () {
      assert.pass("The tabFloater was hidden.");
      assert.equal(this.toString(), tabFloater, "The 'this' object is the tabFloater.");
      tabFloater.destroy();
      done();
    }
  });
};


exports["test Document Reload"] = function(assert, done) {

  const { TabFloater } = require('tab-floater');
  let content =
    "<script>" +
    "setTimeout(function () {" +
    "  window.location = 'about:blank';" +
    "}, 250);" +
    "</script>";
  let messageCount = 0;
  let tabFloater = TabFloater({
    contentURL: "data:text/html;charset=utf-8," + encodeURIComponent(content),
    contentScript: "self.postMessage(window.location.href)",
    onMessage: function (message) {
      messageCount++;
      if (messageCount == 1) {
        assert.ok(/data:text\/html/.test(message), "First document had a content script");
      }
      else if (messageCount == 2) {
        assert.equal(message, "about:blank", "Second document too");
        tabFloater.destroy();
        done();

      }
    }
  });
};

exports["test Resize TabFloater"] = function(assert, done) {
  const { TabFloater } = require('tab-floater');

  // These tests fail on Linux if the browser window in which the tabfloater
  // is displayed is not active.  And depending on what other tests have run
  // before this one, it might not be (the untitled window in which the test
  // runner executes is often active).  So we make sure the browser window
  // is focused by focusing it before running the tests.  Then, to be the best
  // possible test citizen, we refocus whatever window was focused before we
  // started running these tests.

  let activeWindow = Cc["@mozilla.org/embedcomp/window-watcher;1"].
                      getService(Ci.nsIWindowWatcher).
                      activeWindow;
  let browserWindow = Cc["@mozilla.org/appshell/window-mediator;1"].
                      getService(Ci.nsIWindowMediator).
                      getMostRecentWindow("navigator:browser");


  function onFocus() {
    browserWindow.removeEventListener("focus", onFocus, true);

    let tabFloater = TabFloater({
      contentScript: "self.postMessage('')",
      contentScriptWhen: "end",
      contentURL: "data:text/html;charset=utf-8,",
      height: 10,
      width: 10,
      onMessage: function (message) {
        tabFloater.show();
      },
      onShow: function () {
        tabFloater.resize(100,100);
        tabFloater.hide();
      },
      onHide: function () {
        console.log("TabFloater width", tabFloater.width, "TabFloater height", tabFloater.height);
        assert.ok((tabFloater.width == 100) && (tabFloater.height == 100),
          "The tabFloater was resized.");
        if (activeWindow)
          activeWindow.focus();
        done();
      }
    });
  }

  if (browserWindow === activeWindow) {
    onFocus();
  }
  else {
    browserWindow.addEventListener("focus", onFocus, true);
    browserWindow.focus();
  }
};


require("test").run(exports);