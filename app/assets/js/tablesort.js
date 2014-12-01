

$(function() {

  $("table:first").tablesorter({
    theme : 'blue',
    // initialize zebra striping and resizable widgets on the table
    widgets: [ "zebra", "resizable" ],
    widgetOptions: {
      resizable_addLastColumn : true
    }
  });

});