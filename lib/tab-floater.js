/*
* Copyrights Loic J. Duros 2013
* lduros@member.fsf.org
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cc, Ci } = require("chrome");
const { Symbiont } = require('sdk/content/content');


const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].
                       getService(Ci.nsIWindowMediator);
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var tabFloater = {
  floater: null,
  /*
   * Use method to convert a top/left ratio into a position in pixels
   */
  percentToSize: function () {

  },

  createFloater: function (window) {
    window = window || windowMediator.getMostRecentWindow(null);
    let document = window.document;
    this.floater = document.createElementNS(XUL_NS, 'hbox');
    this.floater.setAttribute('flex', '0');
    this.floater.setAttribute("transparent", "transparent");
    this.floater.setAttribute("right", "0");
    this.floater.setAttribute("bottom", "0");
    this.floater.setAttribute("height", "200");
    this.floater.setAttribute("width", "200");
    this.floater.style.setProperty("position", "absolute");

    let frame = document.createElementNS(XUL_NS, 'iframe');
    frame.setAttribute('type', 'content');
    frame.setAttribute('flex', '1');
    frame.setAttribute('transparent', 'transparent');
    frame.setAttribute("src","data:;charset=utf-8,");
    let h1 = document.createElementNS(XUL_NS, 'h1');
    h1.textContent = "Hello";
    this.floater.appendChild(h1);
    //this.floater.appendChild(frame);
    //document.getElementById("main-window").appendChild(floater);
    window.gBrowser.mCurrentBrowser.parentNode.appendChild(this.floater);
  },

  show: function (window) {

    if (this.floater == null)
      this.createFloater();
    else
      this.floater.style.setProperty("display", "block");

  },

  hide: function () {
    this.floater.style.setProperty("display", "none");
  },

  toggle: function () {
    if (this.floater == null || 
        this.floater.style.getPropertyValue("display") === 'none') {
      this.show();
    } else {
      this.hide();
    }
    
  }

};

exports.tabFloater = tabFloater;
