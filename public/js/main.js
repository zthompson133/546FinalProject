(function ($) {
    let theForm = $("#eventSearchForm");
    let searchTerm = $("#keyword");
    let theResults = $("#searchResults");
    let returnLink = $("#rootLink");
    let theError = $("#noinput");
    let tableRows = $("#resultrows");
    returnLink.hide();
    theResults.hide();
    theError.hide();
    theForm.submit(function (event) {
      event.preventDefault();
      returnLink.show();
      let theTerm = searchTerm.val();
      theTerm = theTerm.trim();
      if(theTerm.length === 0) {
        theError.show();
      }
      else {
        theResults.show();
        let theChildren = tableRows.children();
        theChildren.each(function(index) {
            let jqueryElem = $(this);
            let theWords = jqueryElem.data("name").toLowerCase().split(/\W+/);
            theWords.push(...jqueryElem.data("description").toLowerCase().split(/\W+/));
            if(theWords.includes(theTerm)) {
                jqueryElem.show();
            }
            else {
                jqueryElem.hide();
            }
        });
      }
    });
  })(window.jQuery);