//Checks to see if a function was given the right number of arguments.
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
        throw 'String must be provided'
    }
    if (typeof(string) !== 'string') {
        throw 'Input provided must be a string'
    }
    if (string.trim() === "") {
        throw 'String cannot be empty'
    }
    return string.trim()
}