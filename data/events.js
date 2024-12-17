import { users } from "../config/mongoCollections.js";
import { events } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helpers from "./helpers.js";
import * as usersData from "./users.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import e from "express";
import { get } from "http";
import { threadId } from "worker_threads";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "eventplanner363@gmail.com",
    pass: process.env.PASSWD, //"cqtf wxoa ayzb egss",
  },
});

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
  const user = await usersData.getUserByEmail(organizer);
  if (!user) {
    throw new Error("No Organizer with give mail found.");
  }
  name = helpers.isValidString(name, "name");
  description = helpers.isValidString(description, "description");
  helpers.checkValidDate(date, "Date");
  helpers.isValidTime(starttime, "Start time");
  helpers.checkEndTime(starttime, endtime, "End time");
  location = helpers.isValidString(location, "location");
  organizer = helpers.isValidString(organizer, "organizer");
  //should check If organizer mail  is valid
  Class = helpers.isValidClass(Class, "class");
  if (Poster == null) {
    Poster = "../public/imgs/default.jpg";
  }
  feedback = [];
  rating = user.rating;
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
    class: Class,
    Poster: Poster,
    feedback: feedback,
    rating: rating,
    attendees: attendees,
    numberOfAttendees: numberOfAttendees,
  };
  const eventsCollection = await events();
  const insertInfo = await eventsCollection.insertOne(newEvent);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Could not add event";
  }
  const newId = insertInfo.insertedId.toString();
  const event = await getEventByID(newId);
  await usersData.changeField(
    organizer,
    "createdEvents",
    user.createdEvents.concat(newId)
  );
  return event;
}

export async function editEvent(
  eventId,
  name,
  description,
  date,
  starttime,
  endtime,
  location,
  Poster,
) {
  name = helpers.isValidString(name, "name");
  description = helpers.isValidString(description, "description");
  helpers.checkValidDate(date, "Date");
  helpers.isValidTime(starttime, "Start time");
  helpers.checkEndTime(starttime, endtime, "End time");
  location = helpers.isValidString(location, "location");
  //should check If organizer mail  is valid
  if (Poster == null) {
    Poster = "default";
  }
  let newEvent = {
    name: name,
    description: description,
    date: date,
    starttime: starttime,
    endtime: endtime,
    location: location,
    Poster: Poster,
  };
  const eventsCollection = await events();
  const updateData = { $set: newEvent };
  const updatedInfo = await eventsCollection.findOneAndUpdate(
    { _id: new ObjectId(eventId) },
    updateData,
    { returnDocument: "after" }
  );
  if (!updatedInfo) {
    throw "Could not update event.";
  }
  return updatedInfo.value;
}
//Returns a list of all events from the DB.
export async function getAllEvents() {
  helpers.checkArgs(arguments, 0);
  const allEvents = await events();
  let theEvents = await allEvents.find({}).toArray();
  return theEvents;
}

export async function getEventByID(id) {
  id = helpers.isValidString(id, "Event ID");
  const eventCollection = await events();
  const event = await eventCollection.findOne({ _id: new ObjectId(id) });

  if (event === null) {
    throw "No event with that id";
  }

  event._id = event._id.toString();

  return event;
}

export async function registerForEvent(eventId, userId) {
  const eventCollection = await events();
  const userCollection = await users();
  let event = await getEventByID(eventId);
  let user = await usersData.getUserById(userId);
  if (!event) {
    throw new Error("No event with that id");
  }
  if (!user) {
    throw new Error("No user with that id");
  }
  if (event.attendees.includes(userId)) {
    throw new Error("User already registered for the event");
  }
  const registered = user.registeredEvents;
  if (registered) {
    if (registered.includes(eventId)) {
      throw new Error("User already registered for the event");
    }
  }
  event.attendees.push(userId);
  event.numberOfAttendees++;
  const updateEventInfo = await eventCollection.updateOne(
    { _id: new ObjectId(eventId) },
    {
      $push: { attendees: userId },
      $inc: { numberOfAttendees: 1 },
    }
  );
  if (updateEventInfo) {
    console.log("event updated");
    const updateUserInfo = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { registeredEvents: eventId } }
    );
    if (updateUserInfo) {
      console.log("user updated");

      if (updateUserInfo && updateEventInfo) {
        const info = await transporter.sendMail({
          from: '"EventPlanner" <eventplanner363@gmail.com>',
          to: user.email,
          subject: `Event Registration Confirmation: ${event.name}`,
          text: `You have successfully registered for the event ${event.name}. 
      **Event Details:**
    * Name: ${event.name}
    * Date: ${event.date}
    * Start Time: ${event.starttime}
    * End Time: ${event.endtime}
    * Location: ${event.location} 
    * We look forward to seeing you there!

    Sincerely,

    The EventPlanner Team`,
          html: `
    <p>Hi there,</p>
    <p>
      This email confirms your registration for the upcoming event, <strong>"${event.name}"</strong>.
    </p>
    <p>
      **Event Details:**<br>
      * Name: ${event.name}<br>
      * Date: ${event.date}<br>
      * Start Time: ${event.starttime}<br>
      * End Time: ${event.endtime}<br>
      * Location: ${event.location} 
    </p>
    <p>We look forward to seeing you there!</p>
    <p>Sincerely,</p>
    <p>The EventPlanner Team</p>
  `,
        });
      }
    } else {
      throw new Error("Error updating user");
    }
  } else {
    throw new Error("Error updating event");
  }

  return event;
}

export async function unregisterFromEvent(eventId, userId) {
  const eventCollection = await events();
  const userCollection = await users();
  let event = await getEventByID(eventId);
  let user = await usersData.getUserById(userId);

  if (!event) {
    throw new Error("No event with that id");
  }

  if (!user) {
    throw new Error("No user with that id");
  }

  if (!event.attendees.includes(userId)) {
    throw new Error("User is not registered for the event");
  }

  const updatedAttendees = event.attendees.filter(
    (attendeeId) => attendeeId !== userId
  );
  event.attendees = updatedAttendees;
  event.numberOfAttendees--;

  const updateEventInfo = await eventCollection.updateOne(
    { _id: new ObjectId(eventId) },
    {
      $pull: { attendees: userId },
      $inc: { numberOfAttendees: -1 },
    }
  );

  if (updateEventInfo) {
    console.log("Event updated");

    const updateUserInfo = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { registeredEvents: eventId } }
    );

    if (updateUserInfo) {
      console.log("User updated");
      const info = await transporter.sendMail({
        from: '"EventPlanner" <eventplanner363@gmail.com>',
        to: user.email,
        subject: `Event UnRegistration Confirmation: ${event.name}`,
        text: `You have successfully unregistered for the event ${event.name}. 
    **Event Details:**
  * Name: ${event.name}
  * Date: ${event.date}
  * Start Time: ${event.starttime}
  * End Time: ${event.endtime}
  * Location: ${event.location} 
  * we hope to see you at another event soon!

  Sincerely,

  The EventPlanner Team`,
        html: `
  <p>Hi there,</p>
  <p>
    This email confirms your unregistration for the upcoming event, <strong>"${event.name}"</strong>.
  </p>
  <p>
    **Event Details:**<br>
    * Name: ${event.name}<br>
      * Date: ${event.date}<br>
      * Start Time: ${event.starttime}<br>
      * End Time: ${event.endtime}<br>
      * Location: ${event.location} 
  </p>
  <p>we hope to see you at another event soon!</p>
  <p>Sincerely,</p>
  <p>The EventPlanner Team</p>
`,
      });
      return event;
    } else {
      throw new Error("Error updating user");
    }
  } else {
    throw new Error("Error updating event");
  }
}

export async function pastEvents(user) {
  const theEvents = await getEventsByClass(user.class);
  const activeEvents = [];
  const now = new Date();

  for (const event of theEvents) {
    const [year, month, day] = event.date.split("-").map(Number);
    const [startHour, startMinute] = event.starttime.split(":").map(Number);

    const eventStartTime = new Date(
      year,
      month - 1,
      day,
      startHour,
      startMinute
    );

    if (eventStartTime < now) {
      activeEvents.push(event);
    }
  }

  activeEvents.sort((a, b) => {
    const [yearA, monthA, dayA] = a.date.split("-").map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const [yearB, monthB, dayB] = b.date.split("-").map(Number);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB - dateA;
  });

  return activeEvents;
}

//Returns a list of all events whose class matches theClass parameter.
export async function getEventsByClass(theClass) {
  helpers.checkArgs(arguments, 1);
  let allEvents = await getAllEvents();
  let finalEvents = [];
  for (let a = 0; a < allEvents.length; a++) {
    let theEvent = allEvents[a];
    if (theEvent.class === theClass) {
      finalEvents.push(theEvent);
    }
  }
  return finalEvents;
}

export async function moveRegisteredToAttended(userId) {
  const userCollection = await users();
  let user = await usersData.getUserById(userId);

  const past = await pastEvents(user);
  const pastEventIds = [];
  for (const event of past) {
    pastEventIds.push(event._id.toString());
  }

  const updatedRegistered = [];
  const updatedAttended = [];
  for (const event of user.attendedEvents) {
    updatedAttended.push(event);
  }

  for (const eventId of user.registeredEvents) {
    const event = await getEventByID(eventId);
    if (pastEventIds.includes(event._id.toString())) {
      updatedAttended.push(event._id.toString());
    } else {
      updatedRegistered.push(event._id.toString());
    }
  }

  user.registeredEvents = updatedRegistered;
  user.attendedEvents = updatedAttended;

  const updateUserInfo = await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        registeredEvents: user.registeredEvents,
        attendedEvents: user.attendedEvents,
      },
    }
  );

  return updateUserInfo;
}
export async function removeEvent(eventId) {
  let theEvent = await getEventByID(eventId);
  let theAttendees = theEvent.attendees;
  for(let a = 0; a < theAttendees.length; a++) {
    let theUser = await usersData.getUserById(theAttendees[a]);
    let eventList = theUser.registeredEvents;
    const index = eventList.indexOf(eventId);
    if (index !== -1) {
      eventList.splice(index, 1);
      await usersData.changeField(theUser.email, "registeredEvents", eventList);
    }
  }
  const userCollection = await users();
  const theInfo = await userCollection.findOneAndDelete({_id: new ObjectId(eventId)});
  if(!theInfo) {
    throw "Could not delete event.";
  }
  return true;

}


