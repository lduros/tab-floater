const timer = require("timers");
const { TabFloater } = require("tab-floater");

//timer.setTimeout(function () { tabFloater.show() }, 100);

var tabFloater = TabFloater({
  contentURL: 'http://www.gnu.org',
  contentScript: "console.log('hello'); console.log(document.body.innerHTML)",
  width:400,
  height:400
});

require("widget").Widget({
  id: "hello-display",
  label: "My Hello Widget",
  content: "Hello!",
  width: 50,

  onClick: function() {
    tabFloater.toggle();
  }


});
