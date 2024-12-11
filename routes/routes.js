import e, { Router } from 'express';
import * as main from "../public/js/main.js";
import path from "path";
import * as userData from "../data/users.js";
import * as eventData from "../data/events.js";
import * as helpers from "../data/helpers.js";
import { runInNewContext } from 'vm';
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
  if(activeUser) {
    let theUser = await userData.getUserByEmail(activeUser);
    let theEvents = await eventData.getEventsByClass(theUser.class);    
    res.render(path.resolve("static/homepage.handlebars"), {user: theUser, events: theEvents});
  }
  else {
    res.render(path.resolve("static/login.handlebars"));
  }
});
router.route("/createaccount").post(async (req, res) => {
  try {
    let theBody = req.body;
    let signupClass = true;
    if(theBody.signup_class === "on") {
      signupClass = false;
    }
    let userObject = await userData.addUser(
      theBody.signup_first_name,
      theBody.signup_last_name,
      theBody.signup_email,
      signupClass,
      theBody.signup_password1,
      theBody.signup_password2
    );
    const finalUserObject = await userData.sendEmail(userObject["email"], 
      "verificationCode", "verification code");
    res.render(path.resolve("static/verifyemail.handlebars"));
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Create account error: " + e});
  }
});
router.route("/sendveremail").post(async (req, res) => {
  try {
    const theBody = req.body;
    if(theBody.new_veremail) {
      const finalUserObject = await userData.sendEmail(theBody.errorveremail, 
        "verificationCode", "verification code");
    }
    res.render(path.resolve("static/verifyemail.handlebars"));
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Send account verification email error: " + e});
  }
});
router.route("/sendpasswdemail").post(async (req, res) => {
  try {
    const theBody = req.body;
    if(theBody.new_pwdemail) {
      const finalUserObject = await userData.sendEmail(req.body.errorpwdemail, 
        "password", "new password");
    }
    res.render(path.resolve("static/changepassword.handlebars"));
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Create password reset email error: " + e});
  }
});
router.route("/changepassword").post(async (req, res) => {
  try {
    const theBody = req.body;
    let theUser = await userData.newPassword(
      theBody.changepassword_email, 
      theBody.temp_passwd,
      theBody.changepassword_pwd1,
      theBody.changepassword_pwd2);
    let theEvents = await eventData.getEventsByClass(theUser.class);
    activeUser = theUser["email"];
    res.render(path.resolve("static/homepage.handlebars"), {user: theUser, events: theEvents});
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Reset password error: " + e});
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

    let finalUser = await userData.changeField(activeUser, "verified", true);

    let theEvents = await eventData.getEventsByClass(finalUser.class);
    
    res.render(path.resolve("static/homepage.handlebars"), {user: finalUser, events: theEvents});
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Login error: " + e});
  }
});
router.route("/verifyemail").post(async (req, res) => {
  let theBody = req.body;
  helpers.checkArgs(Object.values(theBody), 3);
  let theEmail = theBody.ve_email;
  let thePassword = theBody.ve_password;
  let theCode = theBody.ve_code;
  try {
    let theUser1 = await userData.checkPassword(theEmail, thePassword);
    let theUser2 = await userData.checkCode(theEmail, theCode);
    if(theUser1["_id"].toString() !== theUser2["_id"].toString()) {
      console.log("Database error. User object returned by checkPassword does \
        not match user object returned by checkCode.");
      return false;
    }
    let theEvents = await eventData.getEventsByClass(theUser1.class);
    activeUser = theUser1["email"];
    res.render(path.resolve("static/homepage.handlebars"), {user: theUser1, events: theEvents});
  }
  catch(e) {
    res.render(path.resolve("static/accounterror.handlebars"), 
      {error: "Verify account error: " + e});
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
  if(theUser["verified"]) {
    verified = "Yes";
  }
  res.render(path.resolve("static/profile.handlebars"), {user: theUser, class: theClass, verified: verified});
});
router.route("/searchevents").post(async (req, res) => {
 //Not done yet 
});
router.route("/createevent").post(async (req, res) => {
 //Not done yet 
});
export default router;