import {users} from '../config/mongoCollections.js';
import {events} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as helpers from "./helpers.js";
import * as eventsData from "./events.js";


//Returns an object of all users, where the keys are the email addresses, and the values are ther user 
//objects themselves. Not debugged as of 11/26.
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

export async function getUserByID(id) {
    id = isValidString(id)
    if (!ObjectId.isValid(id)) {
      throw 'invalid object ID'
    }
  
    const userCollection = await users()
    const user = await userCollection.findOne({_id: new ObjectId(id)})
  
    if (user === null) {
      throw 'No team with that id'
    }
  
    user._id = user._id.toString()
  
    return user
};

//Verifies the email/password pair. Not done yet.
export async function verifyUser(email, password) {
    helpers.checkArgs(arguments, 2);
    let theUser = await getUserByEmail(email);
    password = helpers.checkString(password, "password");
    if(!theUser) {
        throw "No user exists with that email.";
    }
    //Code does not yet verify if the password is correct.

    return theUser;
}

export async function addUser() {
}