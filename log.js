const Chalk = require('chalk');


const Log = function () {};

// Make short cuts of all of the colours/styles from Chalk
Object.keys(Chalk.styles).forEach((style) => {
    Log[style] = Chalk[style];
});

Log.silent = false;


Log._log = function () {
    if (Log.silent) return;
    
    let args = Array.from(arguments);
    if (args.length < 2) return;
    
    let colour = args[0];
    let action;
    let message;
    
    if (args.length == 2) {
        action = new Date();
        message = args[1];
    } else {
        action = args[1];
        message = args.slice(2).join(' ');
    }
    
    // Make the whole message the colour
    if (colour.match(/!$/)) {
        colour = colour.replace(/!$/, '');
        message = Log[colour](message);
    }
    
    if (colour.match(/~$/)) {
        // This is a temporary log line
        colour = colour.replace(/~$/, '');
        process.stdout.write(Log[colour](`[${action}]`) + ' ' + message + "\r");
    } else {
        console.log(Log[colour](`[${action}]`), message);
    }
}


Log.info = function () {
    return Log._log('green', ...arguments);
};

Log.progressInfo = function () {
    return Log._log('green~', ...arguments);
};


Log.error = function () {
    return Log._log('red', ...arguments);
}


Log.warning = function () {
    return Log._log('yellow', ...arguments);
}


Log.notice = function () {
    return Log._log('magenta', ...arguments);
}


Log.muted = function () {
    return Log._log('gray!', ...arguments);
}


Log.clearLine = function () {
    if (Log.silent) return;
    
    process.stdout.write("                                                                                \r");
}


module.exports = Log;