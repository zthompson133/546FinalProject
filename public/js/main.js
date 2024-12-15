(function ($) {
    let theForm = $("#eventSearchForm");
    let searchTerm = $("#keyword");
    let theResults = $("#searchResults");
    let tableRows = $("#resultrows");
    let theError = $("#noinput");
    let emptySearch = $("#emptysearch");
    let showAll = $("#showall");
    theResults.show();
    theError.hide();
    showAll.hide();
    emptySearch.hide();
    theForm.submit(function (event) {
      event.preventDefault();
      showAll.show();
      let theTerm = searchTerm.val();
      theTerm = theTerm.trim();
      if(theTerm.length === 0) {
        theError.show();
      }
      else {
        theResults.show();
        let theChildren = tableRows.children();
        let validChildren = 0;
        theChildren.each(function(index) {
            let jqueryElem = $(this);
            let theWords = jqueryElem.data("name").toLowerCase().split(/\W+/);
            theWords.push(...jqueryElem.data("description").toLowerCase().split(/\W+/));
            if(theWords.includes(theTerm)) {
                jqueryElem.show();
                validChildren++;
            }
            else {
                jqueryElem.hide();
            }
        });
        if(validChildren === 0) {
            emptySearch.show();
        }
      }
    });
  })(window.jQuery);