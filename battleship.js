const { Worker, isMainThread } = require('worker_threads');
const readline = require('readline-sync');
const gameController = require("./GameController/gameController.js");
const cliColor = require('cli-color');
const beep = require('beepbeep');
const position = require("./GameController/position.js");
const letters = require("./GameController/letters.js");
let telemetryWorker;

class Battleship {
    start() {
        telemetryWorker = new Worker("./TelemetryClient/telemetryClient.js");

        console.log("Starting...");
        telemetryWorker.postMessage({ eventName: 'ApplicationStarted', properties: { Technology: 'Node.js' } });

        console.log(cliColor.magenta("                                     |__"));
        console.log(cliColor.magenta("                                     |\\/"));
        console.log(cliColor.magenta("                                     ---"));
        console.log(cliColor.magenta("                                     / | ["));
        console.log(cliColor.magenta("                              !      | |||"));
        console.log(cliColor.magenta("                            _/|     _/|-++'"));
        console.log(cliColor.magenta("                        +  +--|    |--|--|_ |-"));
        console.log(cliColor.magenta("                     { /|__|  |/\\__|  |--- |||__/"));
        console.log(cliColor.magenta("                    +---------------___[}-_===_.'____                 /\\"));
        console.log(cliColor.magenta("                ____`-' ||___-{]_| _[}-  |     |_[___\\==--            \\/   _"));
        console.log(cliColor.magenta(" __..._____--==/___]_|__|_____________________________[___\\==--____,------' .7"));
        console.log(cliColor.magenta("|                        Welcome to Battleship                         BB-61/"));
        console.log(cliColor.magenta(" \\_________________________________________________________________________|"));
        console.log();

        this.InitializeGame();
        this.StartGame();
    }

    hit() {
        beep();

        console.log(cliColor.red("                \\         .  ./"));
        console.log(cliColor.red("              \\      .:\";'.:..\"   /"));
        console.log(cliColor.red("                  (M^^.^~~:.'\")."));
        console.log(cliColor.red("            -   (/  .    . . \\ \\)  -"));
        console.log(cliColor.red("               ((| :. ~ ^  :. .|))"));
        console.log(cliColor.red("            -   (\\- |  \\ /  |  /)  -"));
        console.log(cliColor.red("                 -\\  \\     /  /-"));
        console.log(cliColor.red("                   \\  \\   /  /"));

        if (this.enemyFleet.some(ship => ship.isSunk)) {
            console.log(cliColor.yellow("Sunk Ships: "));
            for (const ship of this.enemyFleet) {
                if (ship.isSunk) {
                    console.log(cliColor.red(`You have sunk the ship ! : ${ship.name}`));
                }
            }
        }
        if (this.enemyFleet.some(ship => !ship.isSunk)) {
            console.log(cliColor.yellow("UnSunk Ships: "));
            for (const ship of this.enemyFleet) {
                if (!ship.isSunk) {
                    console.log(cliColor.red(`Ship not sunk: ${ship.name}`));
                }
            }
        }
    }

    miss() {
        console.log(cliColor.blue("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"));
        console.log(cliColor.blue("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"));
        console.log(cliColor.blue("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"));
        console.log(cliColor.blue("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"));
    }

    endGameMessage() {
        console.log(cliColor.red("====== Press CTRL+C if the game does not exit ======"));
    }

    StartGame() {
        let enemyShipsSunk = [];
        let computerShipsSunk = [];

        console.clear();
        console.log("                  __");
        console.log("                 /  \\");
        console.log("           .-.  |    |");
        console.log("   *    _.-'  \\  \\__/");
        console.log("    \\.-'       \\");
        console.log("   /          _/");
        console.log("  |      _  /");
        console.log("  |     /_\\'");
        console.log("   \\    \\_/");
        console.log("    \"\"\"\"");

        let step = 0;
        do {
            if (gameController.isSunk(this.myFleet)) {
                console.log(cliColor.red("You lost !"));
                this.endGameMessage();
                process.exit(0);
            } else if (gameController.isSunk(this.enemyFleet)) {
                console.log(cliColor.green("You won !"));
                this.endGameMessage();
                process.exit(0);
            }
            step++;
            console.log();
            console.log(cliColor.white(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Step ${step}: ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
            console.log();
            console.log(cliColor.yellow("Player, it's your turn"));
            console.log(cliColor.yellow("Enter coordinates for your shot :"));
            var position = Battleship.ParsePosition(readline.question());
            var isvalidEnemyPos = gameController.CheckValidPosition(position);

            if(!isvalidEnemyPos)
            {
                    console.log("Invalid position, please try again");
                    continue;
                }

            var isHit = gameController.CheckIsHit(this.enemyFleet, position);

            telemetryWorker.postMessage({ eventName: 'Player_ShootPosition', properties: { Position: position.toString(), IsHit: isHit } });


            if (isHit) {
                this.hit();
            } else {
                this.miss();
            }

            console.log(isHit ? cliColor.red("Yeah ! Nice hit !") : cliColor.blue("Miss"));

            var computerPos = this.GetRandomPosition();
            var isvalidCompPos = gameController.CheckValidPosition(computerPos);
            if(!isvalidCompPos)
                {
                        console.log("Invalid position, please try again");
                        continue;
                    }
            var isHit = gameController.CheckIsHit(this.myFleet, computerPos);

            telemetryWorker.postMessage({ eventName: 'Computer_ShootPosition', properties: { Position: computerPos.toString(), IsHit: isHit } });

            console.log();
            let compHitMessage = `Computer shot in ${computerPos.column}${computerPos.row} and ` + (isHit ? `has hit your ship !` : `miss`);
            console.log(isHit ? cliColor.red(compHitMessage) : cliColor.blue(compHitMessage));

            if (isHit) {
                this.hit();
            } else {
                this.miss();
            }
            console.log(cliColor.white(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of Step ${step}: ~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
            console.log();
        }
        while (true);
    }

    static ParsePosition(input) {
        var letter = letters.get(input.toUpperCase().substring(0, 1));
        var number = parseInt(input.substring(1, 2), 10);
        return new position(letter, number);
    }

    GetRandomPosition() {
        var rows = 8;
        var lines = 8;
        var rndColumn = Math.floor((Math.random() * lines));
        var letter = letters.get(rndColumn + 1);
        var number = Math.floor((Math.random() * rows));
        var result = new position(letter, number);
        return result;
    }

    InitializeGame() {
        this.InitializeMyFleet();
        this.InitializeEnemyFleet();
    }

    InitializeMyFleet() {
        this.myFleet = gameController.InitializeShips();

        console.log("Please position your fleet (Game board size is from A to H and 1 to 8) :");

        this.myFleet.forEach(function (ship) {
            console.log();
            console.log(`Please enter the positions for the ${ship.name} (size: ${ship.size})`);
            for (var i = 1; i < ship.size + 1; i++) {
                console.log(`Enter position ${i} of ${ship.size} (i.e A3):`);
                const position = readline.question();
                telemetryWorker.postMessage({ eventName: 'Player_PlaceShipPosition', properties: { Position: position, Ship: ship.name, PositionInShip: i } });
                ship.addPosition(Battleship.ParsePosition(position));
            }
        })
    }

    InitializeEnemyFleet() {
        this.enemyFleet = gameController.InitializeShips();

        this.enemyFleet[0].addPosition(new position(letters.B, 4, false));
        this.enemyFleet[0].addPosition(new position(letters.B, 5, false));
        this.enemyFleet[0].addPosition(new position(letters.B, 6, false));
        this.enemyFleet[0].addPosition(new position(letters.B, 7, false));
        this.enemyFleet[0].addPosition(new position(letters.B, 8, false));

        this.enemyFleet[1].addPosition(new position(letters.E, 6, false));
        this.enemyFleet[1].addPosition(new position(letters.E, 7, false));
        this.enemyFleet[1].addPosition(new position(letters.E, 8, false));
        this.enemyFleet[1].addPosition(new position(letters.E, 9, false));

        this.enemyFleet[2].addPosition(new position(letters.A, 3, false));
        this.enemyFleet[2].addPosition(new position(letters.B, 3, false));
        this.enemyFleet[2].addPosition(new position(letters.C, 3, false));

        this.enemyFleet[3].addPosition(new position(letters.F, 8, false));
        this.enemyFleet[3].addPosition(new position(letters.G, 8, false));
        this.enemyFleet[3].addPosition(new position(letters.H, 8, false));

        this.enemyFleet[4].addPosition(new position(letters.C, 5, false));
        this.enemyFleet[4].addPosition(new position(letters.C, 6, false));
    }
}

module.exports = Battleship;
