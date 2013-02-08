const timer = require("timers");
const { TabFloater } = require("tab-floater");

//timer.setTimeout(function () { tabFloater.show() }, 100);

/*let tabFloater = null;

require("widget").Widget({
  id: "hello-display",
  label: "My Hello Widget",
  content: "Hello!",
  width: 50,

  onClick: function() {
    if (!tabFloater) {
      tabFloater = TabFloater({
        contentURL: require("self").data.url('index.html'),
        contentScript: "console.log(document.getElementsByTagName('h1')[0].textContent);",
        width:400,
        height:400
      });

    }
    tabFloater.toggle();
  }


});*/
