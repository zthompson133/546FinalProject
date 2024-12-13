import * as eventsData from "./data/events.js";
import * as usersData from "./data/users.js";
import { events } from "./config/mongoCollections.js";
import * as helpers from "./data/helpers.js";

console.log(
  await addEvent(
    "Stevens Movie Night",
    "Watch a movie with your friends",
    "2024-12-14",
    "10:15",
    "14:05",
    "Babbio 201",
    "sumanthdasari42@gmail.com",
    "graduate",
    "Event_page.jpg",
    [],
    0,
    [],
    0
  )
);
/*
{
  name: 'Stevens Movie Night',
  description: 'Movie Watching ',
  date: '2024-12-14',
  starttime: '10:15',
  endtime: '14:05',
  location: 'Babbio 201',
  organizer: 'Sumanth Dasari',
  Class: 'graduate',
  Poster: 'EventPage.jpg'
}*/
export async function addEvent(
  name,
  description,
  date,
  starttime,
  endtime,
  location,
  organizer,
  Class,
  Poster,
  feedback,
  rating,
  attendees,
  numberOfAttendees
) {
  name = helpers.isValidString(name, "name");
  description = helpers.isValidString(description, "description");
  helpers.checkValidDate(date, "Date");
  helpers.isValidTime(starttime, "Start time");
  helpers.checkEndTime(starttime, endtime, "End time");
  location = helpers.isValidString(location, "location");
  organizer = helpers.isValidString(organizer, "organizer");
  //should check If organizer mail  is valid
  Class = helpers.isValidClass(Class, "class");

  /*{
  name: 'Stevens Movie Night',
  description: 'Movie Watching ',
  date: '2024-12-14',
  starttime: '10:15',
  endtime: '14:05',
  location: 'Babbio 201',
  organizer: 'Sumanth Dasari',
  Class: 'graduate',
  Poster: 'EventPage.jpg'
}*/
  if (Poster == null) {
    Poster = "default";
  }
  feedback = [];
  rating = 0;
  attendees = [];
  numberOfAttendees = 0;

  let newEvent = {
    name: name,
    description: description,
    date: date,
    starttime: starttime,
    endtime: endtime,
    location: location,
    organizer: organizer,
    Class: Class,
    Poster: Poster,
    feedback: feedback,
    rating: rating,
    attendees: attendees,
    numberOfAttendees: numberOfAttendees,
  };

  const user = await usersData.getUserByEmail(organizer);

  if (!user) {
    throw new Error("No Organizer with give mail found.");
  }
  const eventsCollection = await events();
  const insertInfo = await eventsCollection.insertOne(newEvent);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Could not add event";
  }
  const newId = insertInfo.insertedId.toString();
  const event = await eventsData.getEventByID(newId);
  console.log(`Kotha ID : ${newId}`);
  //let theUser = await usersData.getUserById(organizer);
  if (!user["createdEvents"]) {
    user["createdEvents"] = [];
    //user["createdEvents"].push("hahaha");
  }
  console.log(user);
  await usersData.changeField(
    //theUser["email"],
    organizer,
    "createdEvents",
    user.createdEvents.concat(newId)
  );
  return event;
}
