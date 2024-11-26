/*
Require express and express router as shown in lecture code and worked in previous labs.

Your server this week should not do any of the processing or calculations.  Your server only exists to allow someone to get to the HTML Page and download the associated assets to run the Fibonacci & prime number checking page.

you just need one route to send the static homepage.html file
*/
import { Router } from 'express';
import * as main from "../public/js/main.js";
import path from "path";
const router = Router();
router.get("/", (req, res) => {
  res.sendFile(path.resolve("static/homepage.html"));
});
router.route("/signup").post(async (req, res) => {
  res.sendFile(path.resolve("static/signup.html"));
});
router.route("/login").post(async (req, res) => {
  res.sendFile(path.resolve("static/login.html"));
});
router.route("/verify").post(async (req, res) => {
  let theEmail = req.body.login_email;
  let thePassword = req.body.login_password;
});

export default router;