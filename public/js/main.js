const createEventForm = document.getElementById("create-event-form");

createEventForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let isValid = true;
  const eventNameInput = document.getElementById("event-name");
  const eventDescriptionInput = document.getElementById("event-description");
  const eventDateInput = document.getElementById("event-date");
  const eventStartInput = document.getElementById("event-start-time");
  const eventEndInput = document.getElementById("event-end-time");
  const eventLocationInput = document.getElementById("event-location");
  const classInput = document.getElementById("Class");

  const eventNameError = eventNameInput.nextElementSibling;
  const eventDescriptionError = eventDescriptionInput.nextElementSibling;
  const eventDateError = eventDateInput.nextElementSibling;
  const eventStartError = eventStartInput.nextElementSibling;
  const eventEndError = eventEndInput.nextElementSibling;
  const eventLocationError = eventLocationInput.nextElementSibling;
  const classError = classInput.nextElementSibling;

  const eventNameValue = eventNameInput.value.trim();
  const eventDescriptionValue = eventDescriptionInput.value.trim();
  const eventDateValue = eventDateInput.value.trim();
  const eventStartValue = eventStartInput.value.trim();
  const eventEndValue = eventEndInput.value.trim();
  const eventLocationValue = eventLocationInput.value.trim();

  if (!eventNameValue) {
    eventNameError.textContent = "Event Name is required.";
    eventNameError.style.display = "block";
    isValid = false;
  } else {
    eventNameError.style.display = "none";
  }

  if (!eventDateValue) {
    eventDateError.textContent = "Event Date is required.";
    eventDateError.style.display = "block";
    isValid = false;
  } else {
    eventDateError.style.display = "none";
  }

  if (!eventStartValue) {
    eventStartError.textContent = "Event Start Time is required.";
    eventStartError.style.display = "block";
    isValid = false;
  } else {
    eventStartError.style.display = "none";
  }

  if (!eventEndValue) {
    eventEndError.textContent = "Event End Time is required.";
    eventEndError.style.display = "block";
    isValid = false;
  } else {
    eventEndError.style.display = "none";
  }

  const [startHours, startMinutes] = eventStartValue.split(":").map(Number);
  const [endHours, endMinutes] = eventEndValue.split(":").map(Number);

  const startDateTime = new Date();
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date();
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  if (endDateTime <= startDateTime) {
    eventEndError.textContent = "Event End Time must be after Event Start Time";
    eventEndError.style.display = "block";
    isValid = false;
  } else {
    eventEndError.style.display = "none";
  }

  if (!eventLocationValue) {
    eventLocationError.textContent = "Event Location is required.";
    eventLocationError.style.display = "block";
    isValid = false;
  } else {
    eventLocationError.style.display = "none";
  }

  if (isValid) {
    createEventForm.submit();
  }
});
