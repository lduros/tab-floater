/*
* Copyrights Loic J. Duros 2013
* lduros@member.fsf.org
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cc, Ci } = require("chrome");
const { Symbiont } = require('sdk/content/content');
const { validateOptions: valid } = require('sdk/deprecated/api-utils');

const { getDocShell } = require("sdk/frame/utils");

const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].
                       getService(Ci.nsIWindowMediator);
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
      validNumber = { is: ['number', 'undefined', 'null'] };


let TabFloater = Symbiont.resolve({ constructor: '_init',
                                    _onInit: '_onSymbiontInit',
                                    destroy: '_symbiontDestructor',
                                    _documentUnload: '_workerDocumentUnload'
                                    })
.compose({

  _frame: Symbiont.required,
  _init: Symbiont.required,
  _symbiontDestructor: Symbiont.required,
  _emit: Symbiont.required,
  on: Symbiont.required,
  removeListener: Symbiont.required,

  _inited: false,

  floater: null,
                                      
  /* positioning on screen */
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  get width() this._width,
  set width(value)
    this._width =  valid({ $: value }, { $: validNumber }).$ || this._width,

  get height() this._height,
  
  set height(value)
    this._height =  valid({ $: value }, { $: validNumber }).$ || this._height,
  
  _width: 200,
  _height: 200,


  convertPercentToNumber: function (str) {
    let p, num;

    if ((p = str.indexOf('%')) !== -1 &&
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

  resize: function (width, height) {
    this.width = width;
    this.height = height;
    this.floater.setAttribute("height", height);
    this.floater.setAttribute("width", width);
    this._frame.style.width = this.width + "px";
    this._frame.style.height = this.height + "px";
  },

  createFloater: function () {
    let window = this.window || windowMediator.getMostRecentWindow(null);
    let document = window.document;
    this.floater = document.createElementNS(XUL_NS, 'hbox');
    this.floater.setAttribute('flex', '0');
    this.floater.setAttribute("transparent", "transparent");
    this.floater.setAttribute("right", "0");
    this.floater.setAttribute("bottom", "0");
    this.floater.style.setProperty("position", "absolute");
    
    let frame = this._frame = document.createElementNS(XUL_NS, 'iframe');
    frame.setAttribute('type', 'content');
    frame.setAttribute('flex', '1');
    frame.setAttribute('transparent', 'transparent');
    frame.setAttribute("src","data:;charset=utf-8,");
    this.resize(this.width, this.height);
    this.floater.appendChild(frame);
    window.gBrowser.mCurrentBrowser.parentNode.appendChild(this.floater);
    return frame;
  },

  show: function (window) {

    if (this.floater == null)
      this.createFloater();
    else
      this.floater.style.setProperty("display", "block");

    this._emit('show');

    return this._public;

  },

  hide: function () {
    this.floater.style.setProperty("display", "none");
    this._emit('hide');
    return this._public;
  },

  toggle: function () {
    if (this.floater == null || 
        this.floater.style.getPropertyValue("display") === 'none') {
      this.show();
    } else {
      this.hide();
    }
    
  },
  constructor: function TabFloater(options) {
    // `getMyFrame` returns the host application frame in which
    // the page is loaded.
    this.on('inited', this._onSymbiontInit.bind(this));
    this.on('propertyChange', this._onChange.bind(this));
    
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
    if ('window' in options)
      this.window = options.window;
    else
      this.window = null;

    // create xul:hbox and add frame to options
    options.frame = this.createFloater();
    this._init(options);



  },
  destroy: function () {
    this._removeAllListeners('show');
    this._removeAllListeners('hide');
    this._removeAllListeners('propertyChange');
    this._removeAllListeners('inited');
    // defer cleanup to be performed after panel gets hidden
    this.floater = null;
    this._symbiontDestructor(this);
    this._removeAllListeners();
  },

 /**
   * Notification that panel was fully initialized.
   */
  _onInit: function _onInit() {
    this._inited = true;

    // perform all deferred tasks like initSymbiont, show, hide ...
    // TODO: We're publicly exposing a private event here; this
    // 'inited' event should really be made private, somehow.
    this._emit('inited');
  },

  // Catch document unload event in order to rebind load event listener with
  // Symbiont._initFrame if Worker._documentUnload destroyed the worker
  _documentUnload: function(subject, topic, data) {
    if (this._workerDocumentUnload(subject, topic, data)) {
      this._initFrame(this._frame);
      return true;
    }
    return false;
  },

  _onChange: function _onChange(e) {
    //this._frameLoadersSwapped = false;
    if ('contentURL' in e && this._frame) {
      // Cleanup the worker before injecting the content script in the new
      // document
      this._workerCleanup();
      //this._initFrame(this._frame);
    }
  }
});


exports.TabFloater = TabFloater;
