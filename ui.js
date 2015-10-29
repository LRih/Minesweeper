
//============================================================================= VARIABLES
var _game;
var _isLeftMouseDown = false;
var _isRightMouseDown = false;

//============================================================================= INITIALIZE
$(function()
{
    // disable dragging and context menu
    getGame().on('dragstart', function() { return false })
             .bind('contextmenu', function() { return false });

    // listeners for keeping track of mouse status
    $(document).mousedown(function(e)
    {
        switch (e.which)
        {
            case 1: _isLeftMouseDown = true; break;
            case 3: _isRightMouseDown = true; break;
        }
    }).mouseup(function(e)
    {
        switch (e.which)
        {
            case 1: _isLeftMouseDown = false; break;
            case 3: _isRightMouseDown = false; break;
        }
    });

    $("#difficulty").change(function()
    {
        switch (parseInt($(this).find("option:selected").val()))
        {
            case 0: setGameValues(8, 8, 10); break;
            case 1: setGameValues(16, 16, 40); break;
            case 2: setGameValues(16, 30, 99); break;
        }
    });

    $("#newgame").click(function()
    {
        startNewGame($("#rows").val(), $("#columns").val(), $("#mines").val());
    });

    $("#newgame").trigger("click");
});

//============================================================================= FUNCTIONS
function startNewGame(rows, columns, mines)
{
    _game = new Minesweeper(rows, columns, mines);

    getGame().empty();
    createGrid(rows, columns);
    updateGrid();

    updateStatus("Flags remaining: " + _game.remainingFlagCount());
}


function createGrid(rows, columns)
{
    var grid = $("<table id='grid'></table>").appendTo(getGame());

    for (var i = 0; i < rows; i++)
    {
        var row = $("<tr />").appendTo(grid);
        for (var j = 0; j < columns; j++)
            row.append("<td class='cell hidden'></td>");
    }

    $(".cell").mousedown(function(e)
    {
        var row = $(this).closest('tr').index();
        var col = $(this).index();

        if (_game.isReveal(row, col)) // quick uncover with both mouse buttons
        {
            var flagMatchMine = (_game.getSurroundingFlagCount(row, col) == _game.getSurroundingMineCount(row, col));
            switch (e.which)
            {
                case 1:
                    if (_isRightMouseDown && flagMatchMine)
                    {
                        _game.uncoverSurrounding(row, col);
                        updateGrid();
                    }
                    break;
                case 3:
                    if (_isLeftMouseDown && flagMatchMine)
                    {
                        _game.uncoverSurrounding(row, col);
                        updateGrid();
                    }
                    break;
            }
        }
        else
        {
            switch (e.which)
            {
                case 1:
                    if (!_game.isFlag(row, col))
                    {
                        _game.uncover(row, col);
                        updateGrid();
                    }
                    break;
                case 3:
                    _game.toggleFlag(row, col);
                    updateGrid();
                    break;
            }
        }

        if (_game.isWon()) updateStatus("Won");
        else if (_game.isLost()) updateStatus("Lost");
        else updateStatus("Flags remaining: " + _game.remainingFlagCount());
    });
}

function updateGrid()
{
    var grid = getGrid();
    for (var i = 0; i < _game.rowCount(); i++)
    {
        var rows = grid.find("tr");
        for (var j = 0; j < _game.colCount(); j++)
            updateCell(i, j, rows.eq(i).find("td").eq(j));
    }
}

function updateCell(i, j, cell)
{
    cell.removeClass();
    cell.addClass("cell");

    if (_game.isReveal(i, j))
    {
        var mineCount = _game.getSurroundingMineCount(i, j);
        if (!_game.isMine(i, j) && mineCount > 0)
        {
            cell.html(mineCount);
            cell.addClass("text" + mineCount);
        }
        else cell.empty();

        if (_game.isMine(i, j)) cell.addClass("mine");
    }
    else
    {
        cell.empty();

        cell.addClass("hidden");
        if (_game.isFlag(i, j)) cell.addClass("flag");
    }
}

function updateStatus(status)
{
    $("#status").html(status);
}

//============================================================================= PROPERTIES
function getGame()
{
    return $("#game");
}
function getGrid()
{
    return $("#grid");
}

function setGameValues(rows, columns, mines)
{
    $("#rows").val(rows);
    $("#columns").val(columns);
    $("#mines").val(mines);
}
