const args = process.argv.slice(2);
const battleship = require("./battleship.js");

new battleship().start(args);