import { Router } from 'express';
import * as main from "../public/js/main.js";
import path from "path";
import * as userData from "../data/users.js";
import * as eventData from "../data/events.js";
import * as helpers from "../data/helpers.js";
const router = Router();
router.get("/", (req, res) => {
  res.render(path.resolve("static/landingpage.handlebars"));
});
router.route("/signup").post(async (req, res) => {
  res.render(path.resolve("static/signup.handlebars"));
});
router.route("/login").post(async (req, res) => {
  res.render(path.resolve("static/login.handlebars"));
});
router.route("/verify").post(async (req, res) => {
  helpers.checkArgs(Object.values(req.body), 2);
  let theEmail = req.body.login_email;
  let thePassword = req.body.login_password;
  let theUser;
  try {
    theUser = await userData.verifyUser(theEmail, thePassword);
    let theEvents = await eventData.getEventsByClass(theUser.class);
    res.render(path.resolve("static/homepage.handlebars"), {user: theUser, events: theEvents});
  }
  //Currently an error will always get caught here, since the users DB is empty.
  catch(e) {
    /*
    Errors to handle:
    -No email inputted
    -No password inputted
    -Email does not exist
    -Incorrect password
    */
  }
  //This won't get rendered until users are added.
});

export default router;