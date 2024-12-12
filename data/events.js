import { users } from "../config/mongoCollections.js";
import { events } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helpers from "./helpers.js";
import * as usersData from "./users.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "eventplanner363@gmail.com",
    pass: process.env.PASSWD,
  },
});
export async function addEvent() {}

//Returns a list of all events from the DB.
export async function getAllEvents() {
  helpers.checkArgs(arguments, 0);
  const allEvents = await events();
  let theEvents = await allEvents.find({}).toArray();
  return theEvents;
}

export async function getEventByID(id) {
  helpers.checkArgs(arguments, 1);
  const eventCollection = await events();
  const event = await eventCollection.findOne({ _id: new ObjectId(id) });

  if (event === null) {
    throw "No team with that id";
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

      console.log(updateEventInfo);
      if (updateUserInfo && updateEventInfo) {
        const info = await transporter.sendMail({
          from: '"EventPlanner" <eventplanner363@gmail.com>',
          to: user.email,
          subject: `Event Registration Confirmation: ${event.name}`,
          text: `You have successfully registered for the event ${event.name}. 
      **Event Details:**
    * Name: ${event.name}
    * Start Time: ${event.startTime}
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
      * Start Time: ${event.startTime}<br>
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

//Returns a list of all events whose class matches theClass parameter.
export async function getEventsByClass(theClass) {
  helpers.checkArgs(arguments, 1);
  if (typeof theClass !== "boolean") {
    throw "class is not a boolean.";
  }
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
