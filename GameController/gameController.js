const letters = require("./letters.js");


class GameController {
    static InitializeShips() {
        var colors = require("cli-color");
        const Ship = require("./ship.js");
        var ships = [
            new Ship("Aircraft Carrier", 5, colors.CadetBlue),
            new Ship("Battleship", 4, colors.Red),
            new Ship("Submarine", 3, colors.Chartreuse),
            new Ship("Destroyer", 3, colors.Yellow),
            new Ship("Patrol Boat", 2, colors.Orange)
        ];
        return ships;
    }

    static CheckIsHit(ships, shot) {
        let response = {
        };
        if (shot == undefined)
            throw "The shooting position is not defined";
        if (ships == undefined)
            throw "No ships defined";
        var returnvalue = false;
        response.isHit = true;
        ships.forEach(function (ship) {
            ship.positions.forEach(position => {
                if (position.row == shot.row && position.column == shot.column) {
                    position.hit();
                    returnvalue = true;
                }
            });
            if (ship.positions.every(position => position.isHit))
                {
                    ship.isSunk = true;
                } else {
                    ship.isSunk = false;
                }
        });
        return returnvalue;
    }

    static CheckValidPosition(shot){
        if(shot.row < 1 || shot.row > 8 || isNaN(shot.row))
            return false;

        if(!letters.hasOwnProperty(shot.column))
            return false;

        return true;
    }

    static isSunk(fleet) {
        if (fleet == undefined)
            throw "No ships defined";
        let isSink = true;
        for (const ship of fleet) {
            for (const position of ship.positions) {
                if (!position.isHit) {
                    isSink = false;
                    break;
                }
            }
            if (!isSink) {
                return isSink;
            }
        }
        return isSink;
    }

    static isShipValid(ship) {
        return ship.positions.length == ship.size;
    }
}

module.exports = GameController;
