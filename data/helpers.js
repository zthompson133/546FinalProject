//Checks to see if a function was given the right number of arguments.
import { users } from "../config/mongoCollections.js";
import crypto from "crypto";
import { ObjectId } from "mongodb";

export function checkArgs(args, length) {
  if (args.length != length) {
    throw "Wrong number of arguments. Should be " + length + ".";
  }
  return;
}

//Checks to see if a variable is a string, trims leading and trailing spaces from it, and then checks
//if the resulting string is empty. Returns the trimmed string if an error is not thrown.
export function checkString(str, name) {
  if (!(typeof str === "string")) {
    throw name + " is not a string.";
  }
  str = str.trim();
  if (str.length == 0) {
    throw name + " has zero non-space characters.";
  }
  return str;
}

export function doubleHash(passwd) {
  let digest1 = crypto.createHash("sha256").update(passwd).digest("hex");
  let digest2 = crypto.createHash("sha256").update(digest1).digest("hex");
  return digest2;
}
export function checkId(id, varName) {
  id = isValidString(id, "id");
  if (!ObjectId.isValid(id)) {
    throw varName + " is not a valid id.";
  }
  return id;
}

export function isValidPassword(string) {
  if (string == null) {
      throw "Password cannot be empty"
  }
  if (string.length < 8) {
      throw "Password must be at least 8 digits long"
  }
  let spaces = 0
  let lowercase = 0
  let uppercase = 0
  let number = 0
  let special = 0
  for (const letter of string) {
      if (letter === " ") {
          spaces++
      }
      if (letter === letter.toLowerCase() && letter !== letter.toUpperCase()) {
          lowercase++
      }
      if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
          uppercase++
      }
      if (Number.isInteger(parseInt(letter))) {
          number++
      }
      if (/[^a-zA-Z0-9]/.test(letter)) {
          special++
      }
  }
  if (spaces > 0) {
      throw "Password cannot contain a space"
  }
  if (uppercase < 1) {
      throw "Password must contain at least one uppercase letter"
  }
  if (special < 1) {
      throw "Password must contain at least on special character"
  }
  if (number < 1) {
      throw "Password must contain at least one number"
  }
}

export function checkValidDate(date, varName) {
  if (!date) {
    throw `${varName} cannot be null or undefined`;
  }

  const [year, month, day] = date.split('-').map(Number);
  
  const inputDate = new Date(year, month - 1, day);

  if (isNaN(inputDate.getTime())) {
    throw `${varName} must be a valid date`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    throw `${varName} must be a future date`;
  }

  return true;
}

export function isValidTime(time, varName) {
  if (!time || typeof time !== "string") {
    throw `${varName} must be a valid time string in HH:MM format`;
  }
  const [hours, minutes] = time.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw `${varName} must be a valid time in HH:MM format`;
  }

  return time;
}

export function checkEndTime(startTime, endTime, varName) {
  if (!startTime || !endTime) {
    throw `${varName} requires both start time and end time`;
  }

  isValidTime(startTime, `${varName} startTime`);
  isValidTime(endTime, `${varName} endTime`);

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startDateTime = new Date();
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date();
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  if (endDateTime <= startDateTime) {
    throw `${varName} endTime must be after startTime`;
  }

  return endTime;
}

export function isValidClass(string, varName) {
  checkArgs(arguments, 2);
  if (typeof string == "boolean") {
    return string;
  }
  string = checkString(string, varName).toLowerCase();
  if (string !== "graduate" && string !== "undergraduate") {
    throw "Class must be graduate or undergraduate";
  }
  if (string === 'graduate') {
    return 'graduate'
  } else {
    return 'undergraduate'
  }
}

export function isValidString(string, name) {
  if (string == null) {
    throw `String must be provided for ${name}`;
  }
  if (typeof string !== "string") {
    throw `Input provided for ${name} must be a string`;
  }
  if (string.trim() === "") {
    throw `${name} cannot be empty`;
  }
  return string.trim();
}
