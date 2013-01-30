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

let TabFloater = Symbiont.resolve({ constructor: '_init' }).compose({
  floater: null,

  /* positioning on screen */
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  
  convertPercentToNumber: function (str) {
    let p, num;

    if ((p = options.top.indexOf('%')) !== -1 &&
        p === str.length - 1) {

      let strNum = str.substring(0, str.length -1);
      num = parseInt(strNum, 10);

    }
    
    return (num <= 100) ? num : 0;
    
  },
  /*
   * Use method to convert a top/left ratio into a position in pixels
   */
  percentToSize: function (options) {
    var p;

    if ('top' in options)
        this.top = this.convertPercentToNumber(options.top);
      
    if ('bottom' in options)
      this.bottom = this.convertPercentToNumber(options.bottom);

    if ('left' in options)
      this.left = this.convertPercentToNumber(options.left);
    
    if ('right' in options)
      this.right = this.convertPercentToNumber(options.right);

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

    let frame = this._frame = document.createElementNS(XUL_NS, 'iframe');
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
    return frame;
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
    
  },
  constructor: function Thing(options) {
    // `getMyFrame` returns the host application frame in which
    // the page is loaded.

    options = options || {};
    if ('onShow' in options)
      this.on('show', options.onShow);
    if ('onHide' in options)
      this.on('hide', options.onHide);
    if ('width' in options)
      this.width = options.width;
    if ('height' in options)
      this.height = options.height;
    if ('contentURL' in options)
      this.contentURL = options.contentURL;
    
    this.createFloater();
    
    this._init(options);
  }
});


exports.TabFloater = TabFloater;
