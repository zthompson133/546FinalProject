//Checks to see if a function was given the right number of arguments.
import {users} from '../config/mongoCollections.js';
import crypto from "crypto";

export function checkArgs(args, length) {
    if(args.length != length) {
        throw "Wrong number of arguments. Should be " + length + ".";
    }
    return;
}

//Checks to see if a variable is a string, trims leading and trailing spaces from it, and then checks 
//if the resulting string is empty. Returns the trimmed string if an error is not thrown.
export function checkString(str, name) {
    if(!(typeof str === "string")) {
        throw name + " is not a string.";
    }
    str = str.trim();
    if(str.length == 0) {
        throw name + " has zero non-space characters.";
    }
    return str;
}

export function isValidString (string) {
    if (string == null) {
        throw 'Name must be provided'
    }
    if (typeof(string) !== 'string') {
        throw 'Input provided for name must be a string'
    }
    if (string.trim() === "") {
        throw 'Name cannot be empty'
    }
    return string.trim()
}

export function isValidEmail (string) {
    if (string == null) {
        throw "Email must be provided"
    }
    if (typeof(string) !== 'string') {
        throw 'Input provided for email must be a string'
    }
    if (string.trim() === "") {
        throw 'Email cannot be empty'
    }
    if (string.slice(-13) !== "@stevens.edu") {
        throw "Email must be a valid @stevens.edu email"
    }
    return string.trim().toLowerCase()
}

export function isValidClass (string) {
    if (string == null) {
        throw "Class must be provided"
    }
    if (typeof(string) !== 'string') {
        throw 'Class must be graduate or undergraduate'
    }
    if (string.trim() === "") {
        throw 'Class cannot be empty'
    }
    if (string.trim().toLowerCase() !== 'graduate' & string.trim().toLowerCase() !== 'undergraduate') {
        throw 'Class must be graduate or undergraduate'
    }
    return string.trim().toLowerCase()
}

export function isValidRole (string) {
    if (string == null) {
        throw "Role must be provided"
    }
    if (typeof(string) !== 'string') {
        throw 'Role must be verified or unverified'
    }
    if (string.trim() === "") {
        throw 'Role cannot be empty'
    }
    if (string.trim().toLowerCase() !== 'verified' & string.trim().toLowerCase() !== 'unverified') {
        throw 'Role must be verified or unverified'
    }
    return string.trim().toLowerCase()
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
        throw "No uppercase"
    }
    if (special < 1) {
        throw "No special"
    }
    if (number < 1) {
        throw "No number"
    }
}
