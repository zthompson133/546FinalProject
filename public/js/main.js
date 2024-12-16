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

//client side validation

document.addEventListener("DOMContentLoaded", () => {
    // Landing Page
    const landingPageSignupForm = document.querySelector("form[action='/signup']");
    const landingPageLoginForm = document.querySelector("form[action='/login']");
  
    if (landingPageSignupForm) {
        landingPageSignupForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(landingPageSignupForm);

            const email = document.querySelector("#signup_email").value.trim();
            const password1 = document.querySelector("#signup_password1").value;
            const password2 = document.querySelector("#signup_password2").value;
        
            //basic Validation
            if (!email || !password1 || !password2) {
                isValid = false;
                showError("All fields must be filled out.");
            }
            
            //make sure passwords match validation
            if (password1 !== password2) {
                isValid = false;
                showError("Passwords do not match.");
            }
            
            //basic email format validation
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                showError("Please enter a valid email address.");
            }
            
            //password validation (minimum length of 8 characters)
            if (password1.length < 8) {
                isValid = false;
                showError("Password must be at least 8 characters long.");
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
  
    if (landingPageLoginForm) {
        landingPageLoginForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(landingPageLoginForm);

            const email = document.querySelector("#login_email").value.trim();
            const password = document.querySelector("#login_password").value;
            
            //basic Validation
            if (!email || !password) {
                isValid = false;
                showError("All fields must be filled out.");
            }
            
            //basic email format validation
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                showError("Please enter a valid email address.");
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    //Verify Email and Login
    const verifyEmailForm = document.querySelector("form[action='/verifyemail']");
    if (verifyEmailForm) {
        verifyEmailForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(verifyEmailForm);

            const email = document.querySelector("#ve_email").value.trim();
            const verificationCode = document.querySelector("#ve_code").value.trim();
            const password = document.querySelector("#ve_password").value;
            
            //reset previous error messages
            const errorMessages = document.querySelectorAll(".error");
            errorMessages.forEach(message => message.remove());
            
            //basic Validation
            if (!email || !verificationCode || !password) {
                isValid = false;
                showError("All fields must be filled out.");
            }
            
            //basic email format validation
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                showError("Please enter a valid email address.");
            }
            
            //password validation (minimum length of 8 characters)
            if (password.length < 8) {
                isValid = false;
                showError("Password must be at least 8 characters long.");
            }
            
            //prevent form submission if validation fails
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    //Profile Page
    const profileForm = document.querySelector("form[action='/createaccount']");
    if (profileForm) {
        profileForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(profileForm);

            const firstName = document.querySelector("#signup_first_name").value.trim();
            const lastName = document.querySelector("#signup_last_name").value.trim();
            const email = document.querySelector("#signup_email").value.trim();
            const password1 = document.querySelector("#signup_password1").value;
            const password2 = document.querySelector("#signup_password2").value;
  
            //basic Validation
            if (!firstName || !lastName || !email || !password1 || !password2) {
                isValid = false;
                showError("All fields must be filled out.");
            }
  
            //passwords match validation
            if (password1 !== password2) {
                isValid = false;
                showError("Passwords do not match.");
            }
            
            //basic email format validation
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                showError("Please enter a valid email address.");
            }
  
            //password validation (minimum length of 8 characters)
            if (password1.length < 8) {
                isValid = false;
                showError("Password must be at least 8 characters long.");
            }
  
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    //Feedback Page
    const feedbackForm = document.querySelector("form[action='/eventend']");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(feedbackForm);

            const rating = document.querySelector("#rating").value.trim();
            const comment = document.querySelector("#comment").value.trim();
  
            //basic Validation
            if (!rating || !comment) {
                isValid = false;
                showError("All fields must be filled out.");
            }
  
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
  
    //Create Event Page (Logged In)
    const createEventForm = document.querySelector("form[action='/createevent']");
    if (createEventForm) {
        createEventForm.addEventListener("submit", function (e) {
            let isValid = true;

            //clear previous errors from this form
            clearErrors(createEventForm);

            const eventName = document.querySelector("#event_name").value.trim();
            const eventDate = document.querySelector("#event_date").value;
            const eventLocation = document.querySelector("#event_location").value.trim();
  
            //basic Validation
            if (!eventName || !eventDate || !eventLocation) {
                isValid = false;
                showError("All fields must be filled out.");
            }
  
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
  
    //My Created Events Page
    const myCreatedEventsForm = document.querySelector("form[action='/events']");
    if (myCreatedEventsForm) {
        myCreatedEventsForm.addEventListener("submit", function (e) {
            document.addEventListener("DOMContentLoaded", function () {
                //select all delete buttons in the forms
                const deleteForms = document.querySelectorAll('form[action*="DELETE"]');
                
                deleteForms.forEach((form) => {
                    form.addEventListener("submit", function (e) {
                        //show confirmation dialog
                        const confirmed = confirm("Are you sure you want to delete this event?");
                        if (!confirmed) {
                            e.preventDefault(); //stop the form from submitting
                        }
                    });
                });
            });              
        });
        document.addEventListener("DOMContentLoaded", function () {
            //added hover confirmation feedback for edit buttons
            const editButtons = document.querySelectorAll('form[action*="/edit/"] button');
          
            editButtons.forEach((button) => {
                button.addEventListener("mouseover", function () {
                    button.title = "Edit this event";
                });
            });
        });
        document.addEventListener("DOMContentLoaded", function () {
            const tableBody = document.querySelector("tbody");
            const emptyMessage = document.querySelector("p");
          
            if (!tableBody || tableBody.children.length === 0) {
                emptyMessage.textContent = "You currently have no events.";
            }
        });
        document.addEventListener("DOMContentLoaded", function () {
            const actionForms = document.querySelectorAll('form[action]');
          
            actionForms.forEach((form) => {
                if (!form.action || form.action.trim() === "") {
                    form.querySelector("button").disabled = true;
                }
            });
        });
    }
  
    //helper function to show error messages below fields
    function showError(inputField, message) {
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("errorcss");
        errorDiv.textContent = message;

        //prevent duplicate errors
        clearErrorForField(inputField);

        //insert error after the input field
        inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);
    }

    //helper Function to Clear Errors
    function clearErrors(form) {
        const errorMessages = form.querySelectorAll(".errorcss");
        errorMessages.forEach((message) => message.remove());
    }

    //clear error for specific input field
    function clearErrorForField(inputField) {
        const nextSibling = inputField.nextSibling;
        if (nextSibling && nextSibling.classList && nextSibling.classList.contains("errorcss")) {
            nextSibling.remove();
        }
    }
});
