import e, { Router } from "express";
import path from "path";
import * as userData from "../data/users.js";
import * as eventData from "../data/events.js";
import * as helpers from "../data/helpers.js";
import { runInNewContext } from "vm";

let activeUser = false;
/*
See index.js for description of each route.

*/
const router = Router();
router.get("/", (req, res) => {
  res.render(path.resolve("static/landingpage.handlebars"));
});
router.route("/signup").post(async (req, res) => {
  res.render(path.resolve("static/signup.handlebars"));
});
router.route("/login").post(async (req, res) => {
  //activeUser = "zthompso@stevens.edu";
  /*You can un-comment the line above and add your email if you don't want to log in every time you 
  re-run your code. If this line is un-commented, the route will send you right to the homepage when
  you press login. Just make sure to put the comment back before you commit the code to Github. */
  if (activeUser) {
    let theUser = await userData.getUserByEmail(activeUser);
    let theEvents = await eventData.getEventsByClass(theUser.class);
    let activeEvents = [];
    const now = new Date();
    for (const event of theEvents) {
      const [year, month, day] = event.date.split("-");
      const eventDate = new Date(year, month - 1, day);
      const eventStartTime = new Date(`${event.date}T${event.starttime}`);
      if (eventDate > now) {
        activeEvents.push(event);
      } else if (eventDate.toDateString() === now.toDateString()) {
        if (eventStartTime > now) {
          activeEvents.push(event);
        }
      }
    }
    activeEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.render(path.resolve("static/homepage.handlebars"), {
      user: theUser,
      events: activeEvents,
    });
  } else {
    res.render(path.resolve("static/login.handlebars"));
  }
});
router.route("/createaccount").post(async (req, res) => {
  try {
    let theBody = req.body;
    let signupClass = helpers.isValidClass(theBody.Class, "class");
    let userObject = await userData.addUser(
      theBody.signup_first_name,
      theBody.signup_last_name,
      theBody.signup_email,
      signupClass,
      theBody.signup_password1,
      theBody.signup_password2
    );
    const finalUserObject = await userData.sendEmail(
      userObject["email"],
      "verificationCode",
      "verification code"
    );
    res.render(path.resolve("static/verifyemail.handlebars"));
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Create account error: " + e,
    });
  }
});
router.route("/sendveremail").post(async (req, res) => {
  try {
    const theBody = req.body;
    if (theBody.new_veremail) {
      const finalUserObject = await userData.sendEmail(
        theBody.errorveremail,
        "verificationCode",
        "verification code"
      );
    }
    res.render(path.resolve("static/verifyemail.handlebars"));
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Send account verification email error: " + e,
    });
  }
});
router.route("/sendpasswdemail").post(async (req, res) => {
  try {
    const theBody = req.body;
    if (theBody.new_pwdemail) {
      const finalUserObject = await userData.sendEmail(
        req.body.errorpwdemail,
        "password",
        "new password"
      );
    }
    res.render(path.resolve("static/changepassword.handlebars"));
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Create password reset email error: " + e,
    });
  }
});
router.route("/changepassword").post(async (req, res) => {
  try {
    const theBody = req.body;
    let theUser = await userData.newPassword(
      theBody.changepassword_email,
      theBody.temp_passwd,
      theBody.changepassword_pwd1,
      theBody.changepassword_pwd2
    );
    let theEvents = await eventData.getEventsByClass(theUser.class);
    theEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    activeUser = theUser["email"];
    res.render(path.resolve("static/homepage.handlebars"), {
      user: theUser,
      events: theEvents,
    });
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Reset password error: " + e,
    });
  }
});
router.route("/checkpassword").post(async (req, res) => {
  let theBody = req.body;
  helpers.checkArgs(Object.values(theBody), 2);
  let theEmail = theBody.login_email;
  let thePassword = theBody.login_password;
  let theUser;
  try {
    theUser = await userData.checkPassword(theEmail, thePassword);
    activeUser = theUser["email"];
    //let finalUser = await userData.changeField(activeUser, "verified", true);
    let theEvents = await eventData.getEventsByClass(theUser.class);
    let activeEvents = [];
    const now = new Date();
    for (const event of theEvents) {
      const [year, month, day] = event.date.split("-");
      const eventDate = new Date(year, month - 1, day);
      const eventStartTime = new Date(`${event.date}T${event.starttime}`);
      if (eventDate > now) {
        activeEvents.push(event);
      } else if (eventDate.toDateString() === now.toDateString()) {
        if (eventStartTime > now) {
          activeEvents.push(event);
        }
      }
    }
    activeEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.render(path.resolve("static/homepage.handlebars"), {
      user: theUser,
      events: activeEvents,
    });
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Login error: " + e,
    });
  }
});
router.route("/verifyemail").post(async (req, res) => {
  let theBody = req.body;
  helpers.checkArgs(Object.values(theBody), 3);
  let theEmail = theBody.ve_email;
  let thePassword = theBody.ve_password;
  let theCode = theBody.ve_code;
  try {
    let theUser2 = await userData.checkCode(theEmail, theCode);
    let theUser1 = await userData.checkPassword(theEmail, thePassword);
    if (theUser1["_id"].toString() !== theUser2["_id"].toString()) {
      console.log(
        "Database error. User object returned by checkPassword does \
        not match user object returned by checkCode."
      );
      return false;
    }
    let theEvents = await eventData.getEventsByClass(theUser1.class);
    theEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    activeUser = theUser1["email"];
    res.render(path.resolve("static/homepage.handlebars"), {
      user: theUser1,
      events: theEvents,
      class: userData.getClass(theUser1.class),
    });
  } catch (e) {
    res.render(path.resolve("static/accounterror.handlebars"), {
      error: "Verify account error: " + e,
    });
  }
});
router.route("/logout").post(async (req, res) => {
  activeUser = false;
  res.render(path.resolve("static/landingpage.handlebars"));
});
router.route("/myaccount").post(async (req, res) => {
  res.render(path.resolve("static/accounterror.handlebars"));
});
router.route("/myprofile").post(async (req, res) => {
  let theUser = await userData.getUserByEmail(activeUser);
  let theClass = userData.getClass(theUser);
  let verified = "No";
  if (theUser["verified"]) {
    verified = "Yes";
  }
  res.render(path.resolve("static/profile.handlebars"), {
    user: theUser,
    class: theClass,
    verified: verified,
  });
});
router
  .route("/createevent")
  .get(async (req, res) => {
    if (!activeUser) {
      res.render(path.resolve("static/landingpage.handlebars"));
      return;
    }
    const user = await userData.getUserByEmail(activeUser);
    let events = [];
    for (const event of user.createdEvents) {
      events.push(await eventData.getEventByID(event));
    }
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.render(path.resolve("static/myCreatedEvents.handlebars"), {
      events: events,
    });
  })
  .post(async (req, res) => {
    console.log(req.body);
    res.render(path.resolve("static/create.handlebars"));
  });
router
  .route("/events")
  .get(async (req, res) => {
    //retrieve a list of all events
    if (!activeUser) {
      res.render(path.resolve("static/landingpage.handlebars"));
      return;
    }
    try {
      const eventList = await eventData.getAllEvents();
      return res.json(eventList);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    //create a new event after validating inputs
    const theBody = req.body;
    //make sure there is something present in the req.body

    if (!eventData || Object.keys(eventData).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    //check all inputs, that should respond with a 400
    try {
      let eventName = helpers.isValidString(theBody.name, "Event Title");
      let description = helpers.isValidString(
        theBody.description,
        "Event Description"
      );
      helpers.checkValidDate(theBody.date, "Event Date");
      let starttime = helpers.isValidTime(
        theBody.starttime,
        "Event Start Time"
      );
      let endtime = helpers.checkEndTime(
        theBody.starttime,
        theBody.endtime,
        "Event Data Start Time"
      );
      let location = helpers.checkString(theBody.location, "Location");
      let theClass = helpers.isValidClass(theBody.Class, "Class");
      let poster = "default";
      if (theBody.Poster !== "") {
        poster = theBody.Poster;
      }
      const newEvent = await eventData.addEvent(
        eventName,
        description,
        theBody.date,
        starttime,
        endtime,
        location,
        activeUser,
        theClass,
        poster
      );
      let theUser = await userData.getUserByEmail(activeUser);
      let events = [];
      for (const event of theUser.createdEvents) {
        events.push(await eventData.getEventByID(event));
      }
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
      res.render(path.resolve("static/myCreatedEvents.handlebars"), {
        events: events,
      });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router
  .route("/events/:id")
  .get(async (req, res) => {
    if (!activeUser) {
      res.render(path.resolve("static/landingpage.handlebars"));
      return;
    }
    try {
      console.log(req.params.id);
      req.params.id = helpers.checkId(req.params.id, "Event ID URL Param");
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try getting the event by ID
    try {
      let user = await userData.getUserByEmail(activeUser);
      let userId = user["_id"];
      let studentRegistered = false;
      user.registeredEvents.forEach((e) => {
        if (e === req.params.id) {
          studentRegistered = true;
        }
      });
      const event = await eventData.getEventByID(req.params.id);
      let past = true;
      const now = new Date();
      const [year, month, day] = event.date.split("-");
      const eventDate = new Date(year, month - 1, day);
      const eventStartTime = new Date(`${event.date}T${event.starttime}`);
      if (eventDate > now) {
        past = false;
      } else if (eventDate.toDateString() === now.toDateString()) {
        if (eventStartTime > now) {
          past = false;
        }
      }
      return res.render(path.resolve("static/eventpage.handlebars"), {
        event: event,
        title: "Event Page",
        studentRegistered,
        eligible: user.class === event.class,
        past: past,
      });
    } catch (e) {
      console.log(e);
      return res.status(404).json({ error: e });
    }
  })
  .put(async (req, res) => {
    //update an events details (all fields)
    if (!activeUser) {
      res.render(path.resolve("/static/landingpage.handlebars"));
      return;
    }
    const updatedData = req.body;
    //make sure there is something in the req.body
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    //check all the inputs that will return 400 if they fail
    try {
      req.params.id = helpers.checkId(req.params.id, "Event ID URL Param");

      updatedData.title = helpers.checkString(updatedData.title, "Event Title");

      updatedData.date = helpers.checkString(updatedData.date, "Event Date");
      updatedData.location = helpers.checkString(
        updatedData.location,
        "Location"
      );
      updatedData.organizerId = helpers.checkId(
        updatedData.organizerId,
        "Organizer ID"
      );
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to update the event
    try {
      const updatedEvent = await eventData.updateEventPut(
        req.params.id,
        updatedData
      );
      return res.json(updatedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .patch(async (req, res) => {
    //update specific fields of an event (partially update)
    if (!activeUser) {
      res.render(path.resolve("static/landingpage.handlebars"));
      return;
    }
    const requestBody = req.body;
    //check to make sure there is something in req.body
    if (!requestBody || Object.keys(requestBody).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    //check the inputs that will return 400 if fail
    try {
      req.params.id = helpers.checkId(req.params.id, "Event ID");
      if (requestBody.title)
        requestBody.title = helpers.checkString(
          requestBody.title,
          "Event Title"
        );
      if (requestBody.date)
        requestBody.date = helpers.checkString(requestBody.date, "Event Date");
      if (requestBody.location)
        requestBody.location = helpers.checkString(
          requestBody.location,
          "Location"
        );
      if (requestBody.organizerId)
        requestBody.organizerId = helpers.checkId(
          requestBody.organizerId,
          "Organizer ID"
        );
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to perform update
    try {
      const updatedEvent = await eventData.updateEventPatch(
        req.params.id,
        requestBody
      );
      return res.json(updatedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .delete(async (req, res) => {
    //delete an event by ID
    //check the id
    try {
      req.params.id = helpers.checkId(req.params.id, "Event ID URL Param");
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to delete event
    try {
      const deletedEvent = await eventData.removeEvent(req.params.id);
      return res.json(deletedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/register/:id").get(async (req, res) => {
  if (!activeUser) {
    res.render(path.resolve("/static/landingpage.handlebars"));
    return;
  }
  let theUser = await userData.getUserByEmail(activeUser);
  let userId = theUser["_id"];
  try {
    req.params.id = helpers.checkId(req.params.id, "Event ID URL Param");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const event = await eventData.getEventByID(req.params.id);
    if (!event) {
      throw new Error("No Event exists with that ID");
    }
    const register = await eventData.registerForEvent(
      event._id,
      userId.toString()
    );
    if (register) {
      return res.redirect("/events/" + req.params.id);
    } else {
      return res.status(404).json({ error: "Could not register for event" });
    }
  } catch (e) {
    console.log(e);
    return res.status(404).json({ error: e });
  }
});
router.route("/unregister/:id").get(async (req, res) => {
  if (!activeUser) {
    res.render(path.resolve("/static/landingpage.handlebars"));
    return;
  }
  let theUser = await userData.getUserByEmail(activeUser);
  let userId = theUser["_id"];
  try {
    req.params.id = helpers.checkId(req.params.id, "Event ID URL Param");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const event = await eventData.getEventByID(req.params.id);
    if (!event) {
      throw new Error("No Event exists with that ID");
    }
    const unregister = await eventData.unregisterFromEvent(
      req.params.id,
      userId.toString()
    );
    if (unregister) {
      return res.redirect("/events/" + req.params.id);
    } else {
      return res.status(404).json({ error: "Could not unregister for event" });
    }
  } catch (e) {
    console.log(e);
    return res.status(404).json({ error: e });
  }
});
router.route("/myRegisteredEvents").get(async (req, res) => {
  if (!activeUser) {
    res.render(path.resolve("/static/landingpage.handlebars"));
    return;
  }
  let theUser = await userData.getUserByEmail(activeUser);
  let userId = theUser["_id"];
  try {
    const events = await userData.registeredEvents(userId.toString());
    if (!events) {
      throw new Error("No Events Found");
    }
    console.log({
      events: events,
      title: "My Registered Events",
    });
    return res.render(path.resolve("static/myRegisteredEvents.handlebars"), {
      events: events,
      title: "My Registered Events",
    });
  } catch (e) {
    console.log(e);
    return res.status(404).json({ error: e });
  }
});
router.route("/pastEvents").get(async (req, res) => {
  if (!activeUser) {
    res.render(path.resolve("/static/landingpage.handlebars"));
    return;
  }
  let theUser = await userData.getUserByEmail(activeUser);
  try {
    const events = await eventData.pastEvents(theUser);
    if (!events) {
      throw new Error("No Events Found");
    }
    console.log({
      events: events,
      title: "Past Events",
    });
    return res.render(path.resolve("static/pastEvents.handlebars"), {
      events: events,
      title: "Past Events",
    });
  } catch (e) {
    console.log(e);
    return res.status(404).json({ error: e });
  }
});

export default router;
