const timer = require("timers");
const { tabFloater } = require("tab-floater");

//timer.setTimeout(function () { tabFloater.show() }, 100);

require("widget").Widget({
  id: "hello-display",
  label: "My Hello Widget",
  content: "Hello!",
  width: 50,

  onClick: function() {
    tabFloater.toggle();
  }


});
