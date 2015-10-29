
//============================================================================= CONSTANTS
Minesweeper.COORDS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

//============================================================================= INITIALIZE
function Minesweeper(rows, columns, mines)
{
    if (rows < 5 || columns < 5 || rows > 30 || columns > 30)
        throw "Number of rows/columns must be between 5 and 30"
    else if (mines >= rows * columns)
        throw "Number of mines cannot be greater than " + (rows * columns - 1);

    this.mineCount = mines;
    this.hasStarted = false;
    this.mineReveal = false;
    this.revealCount = 0;

    // create grid
    this.grid = [];
    for (var i = 0; i < rows; i++)
    {
        this.grid.push([]);
        for (var j = 0; j < columns; j++)
            this.grid[i].push(1);
    }
}

// ============================================================================ FUNCTIONS
Minesweeper.prototype.generateMines = function(si, sj)
{
    var cells = [];
    for (var i = 0; i < this.rowCount(); i++)
        for (var j = 0; j < this.colCount(); j++)
            if (i != si || j != sj) cells.push([i, j]);

    for (var i = 0; i < this.mineCount; i++)
    {
        var mineIndex = this.rand(0, cells.length - 1);
        var coord = cells[mineIndex];
        this.setMine(coord[0], coord[1], true);
        cells.splice(mineIndex, 1);
    }
};


Minesweeper.prototype.uncoverSurrounding = function(i, j)
{
    for (var c = 0; c < Minesweeper.COORDS.length; c++)
    {
        var ni = i + Minesweeper.COORDS[c][0];
        var nj = j + Minesweeper.COORDS[c][1];
        if (this.isInBounds(ni, nj)) this.uncover(ni, nj);
    }
};

Minesweeper.prototype.uncover = function(i, j)
{
    if (this.isEnded())
        return;

    if (!this.hasStarted)
    {
        this.hasStarted = true;
        this.generateMines(i, j);
    }

    var stack = [[i, j]];
    while (stack.length > 0)
    {
        var cell = stack.shift();
        var ci = cell[0];
        var cj = cell[1];

        if (this.isFlag(ci, cj) || this.isReveal(ci, cj)) continue;

        this.setReveal(ci, cj, true);
        this.revealCount++;
        if (this.isMine(ci, cj)) this.mineReveal = true;

        if (this.isMine(ci, cj) || this.getSurroundingMineCount(ci, cj) > 0) continue;

        for (var c = 0; c < Minesweeper.COORDS.length; c++)
        {
            var ni = ci + Minesweeper.COORDS[c][0];
            var nj = cj + Minesweeper.COORDS[c][1];

            if (this.isInBounds(ni, nj)) stack.push([ni, nj]);
        }
    }
};


Minesweeper.prototype.isInBounds = function(i, j)
{
    return (i >= 0 && j >= 0 && i < this.rowCount() && j < this.colCount());
};

Minesweeper.prototype.rand = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//============================================================================= PROPERTIES
Minesweeper.prototype.rowCount = function()
{
    return this.grid.length;
};

Minesweeper.prototype.colCount = function()
{
    return this.grid[0].length;
};

Minesweeper.prototype.isEnded = function()
{
    return this.isWon() || this.isLost();
};

Minesweeper.prototype.isWon = function()
{
    var cellCount = this.rowCount() * this.colCount();
    return this.revealCount == cellCount - this.mineCount && !this.isLost();
};

Minesweeper.prototype.isLost = function()
{
    return this.mineReveal;
};


Minesweeper.prototype.setReveal = function(i, j, isReveal)
{
    if (isReveal) this.grid[i][j] &= ~1;
    else this.grid[i][j] |= 1;
};

Minesweeper.prototype.isReveal = function(i, j)
{
    return (this.grid[i][j] & 1) == 0;
};


Minesweeper.prototype.toggleFlag = function(i, j)
{
    if (!this.isEnded())
        this.grid[i][j] ^= 2;
};

Minesweeper.prototype.isFlag = function(i, j)
{
    return (this.grid[i][j] & 2) != 0;
};

Minesweeper.prototype.remainingFlagCount = function()
{
    var flagCount = 0;
    for (var i = 0; i < this.rowCount(); i++)
        for (var j = 0; j < this.colCount(); j++)
            if (!this.isReveal(i, j) && this.isFlag(i, j)) flagCount++;
    return this.mineCount - flagCount;
};

Minesweeper.prototype.getSurroundingFlagCount = function(i, j)
{
    var count = 0;
    for (var c = 0; c < Minesweeper.COORDS.length; c++)
    {
        var ni = i + Minesweeper.COORDS[c][0];
        var nj = j + Minesweeper.COORDS[c][1];

        if (this.isInBounds(ni, nj) && this.isFlag(ni, nj)) count++;
    }
    return count;
};


Minesweeper.prototype.setMine = function(i, j, isMine)
{
    if (isMine) this.grid[i][j] |= 4;
    else this.grid[i][j] &= ~4;
};

Minesweeper.prototype.isMine = function(i, j)
{
    return (this.grid[i][j] & 4) != 0;
};

Minesweeper.prototype.getSurroundingMineCount = function(i, j)
{
    var count = 0;
    for (var c = 0; c < Minesweeper.COORDS.length; c++)
    {
        var ni = i + Minesweeper.COORDS[c][0];
        var nj = j + Minesweeper.COORDS[c][1];

        if (this.isInBounds(ni, nj) && this.isMine(ni, nj)) count++;
    }
    return count;
};
