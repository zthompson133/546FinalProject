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
  id = checkString(id, "id");
  if (!ObjectId.isValid(id)) {
    throw varName + " is not a valid id.";
  }
  return id;
}

export function checkValidDate(date, varName) {
  if (!date) {
    throw `${varName} cannot be null or undefined`;
  }

  const inputDate = new Date(date);
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
  console.log(time);
  const [hours, minutes] = time.split(":").map(Number);
  console.log(`${hours} and ${minutes}`);
  console.log(time.split(":").map(Number));
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

  return true;
}

export function isValidClass(string, varName) {
  string = checkString(string, varName).toLowerCase();
  if (string !== "graduate" && string !== "undergraduate") {
    throw "Class must be graduate or undergraduate";
  }
  return string === "graduate";
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
