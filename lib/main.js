const timer = require("timers");
const { TabFloater } = require("tab-floater");

//timer.setTimeout(function () { tabFloater.show() }, 100);

TabFloater({
  contentURL: 'http://www.google.com'
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
