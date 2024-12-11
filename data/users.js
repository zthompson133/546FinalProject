import {users} from '../config/mongoCollections.js';
import {events} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as helpers from "./helpers.js";
import * as eventsData from "./events.js";
import nodemailer from "nodemailer";
const passwd = "cqtf wxoa ayzb egss";
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "eventplanner363@gmail.com",
      pass: passwd
    },
  });

//Returns an object of all users, where the keys are the email addresses, and the values are ther user 
//objects themselves. Not debugged as of 11/26.

export async function getUserById(id) {
    id = helpers.checkString(id, "id");    
    if (!ObjectId.isValid(id)) {
        throw 'invalid object ID';
    }
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user === null) {
        throw 'No user with that id';
    }
    user._id = user._id.toString();
    return user;
}

export async function usersByEmail() {
    const allUsers = await users();
    let theUsers = await allUsers.find({}).toArray();
    let finalObject = {};
    for(let a = 0; a < theUsers.length; a++) {
        let theUser = theUsers[a];
        finalObject[theUser["email"]] = theUser;
    }
    return finalObject;
}
//Returns a user from the DB by their email address. Returns false if the email does not exist in the DB.
export async function getUserByEmail(email) {
    helpers.checkArgs(arguments, 1);
    email = helpers.checkString(email, "email");
    let usersObject = await usersByEmail();
    let theUser = usersObject[email];
    if(theUser === undefined) {
        return false;
    }
    return theUser;
}

//Verifies the email/password pair. Not done yet.
export async function verifyUser(email, password) {
    email = helpers.isValidEmail(email)
    password = helpers.isValidPassword(password)

    const usersCollection = await users()

    let usersList = await usersCollection.find({}).toArray()
    if (!usersList) {
        throw 'Could not validate username'
    }

    for (const user of usersList) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
          const comparePassword = await bcrypt.compare(password, user.password);
          if (comparePassword) {
            if (!user.isVerified) {
                return {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    Class: user.Class,
                    isVerifies: user.isVerified,
                    attendedEvents: user.attendedEvents,
                    feedback: user.feedback,
                    profilePic: user.profilePic
                }
            } else {
                return {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    Class: user.Class,
                    isVerifies: user.isVerified,
                    attendedEvents: user.attendedEvents,
                    feedback: user.feedback,
                    profilePic: user.profilePic,
                    rating: user.rating,
                    events: user.events
                }
            }
          } else {
            throw 'Either the userId or password is invalid'
          }
        }
    }
}

export async function addUser(firstName, lastName, email, Class, isVerified, attendedEvents, feedback, password, confirmPassword, profilePic) {
    firstName = helpers.isValidString(firstName)
    lastName = helpers.isValidString(lastName)
    email = helpers.isValidEmail(email)
    Class = helpers.isValidClass(Class)
    isVerified = false
    attendedEvents = []
    feedback = []
    password = helpers.isValidPassword(password)
    if (password !== confirmPassword) {
        throw 'Passwords do not match'
    }
    if (profilePic == null) {
        profilePic = 'N/A'
    }

    const saltRounds = 16;
    const hash = await bcrypt.hash(password, saltRounds);

    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        Class: Class,
        isVerified: isVerified,
        attendedEvents: attendedEvents,
        feedback: feedback,
        password: hash,
        profilePic: profilePic
    }

    const usersCollection = await users()
    const insertInfo = await usersCollection.insertOne(newUser)
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add user'

    return {registrationCompleted: true}
}