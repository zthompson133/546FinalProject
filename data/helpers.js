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

export function doubleHash(passwd) {
    let digest1 = crypto.createHash("sha256").update(passwd).digest("hex");
    let digest2 = crypto.createHash("sha256").update(digest1).digest("hex");
    return digest2;
}
