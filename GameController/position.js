class Position {
    constructor(column, row) {
        this.column = column;
        this.row = row;
        this.isHit = false;
    }

    toString() {
        return this.column.toString() + this.row.toString()
    }

}

module.exports = Position;
