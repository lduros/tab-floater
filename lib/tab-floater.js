/*
* Copyrights Loic J. Duros 2013
* lduros@member.fsf.org
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cc, Ci } = require("chrome");
const { Symbiont } = require('sdk/content/content');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');

const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].
                       getService(Ci.nsIWindowMediator);
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var tabFloater = {
  floater: null,
  show: function (window) {
    window = window || getMostRecentWindow();
    let document = window.document;
    this.floater = document.createElementNS(XUL_NS, 'div');

    let frame = document.createElementNS(XUL_NS, 'iframe');
    frame.setAttribute('type', 'content');
    frame.setAttribute('flex', '1');
    frame.setAttribute('transparent', 'transparent');
    frame.setAttribute("src","data:;charset=utf-8,");
    let h1 = document.createElementNS(XUL_NS, 'h1');
    h1.textContent = "Hello";
    this.floater.appendChild(h1);
    //this.floater.appendChild(frame);
    document.getElementById("allTabs-stack").appendChild(this.floater);
  }
};
