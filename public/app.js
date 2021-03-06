let canvas = vp
let c = canvas.getContext('2d')

let sprites = new Image()
sprites.src = 'assets/spritesheet.png'

let ts = 32
let start = {
    x: 2,
    y: 2
}
let raf;
let frames = 0
let _offset = 1
const EMPTY = 0
const EMPTY1 = 8
const WALL = 1
const ROCK = 4
const HOLE = 6
const HERO = 9
const _PUSH = 2
const _IS = 3
const _ROCK = 5
const _WALL = 11
const _HOLE = 7
const _WIN = 10
const _STOP = 12
const DEAD = 14
const _DEAD = 13
const FLAG = 15
const _FLAG = 16
const _YA = 17
const _HERO = 18
const KEY = 19
const _KEY = 20
const UP = "up"
const DOWN = "down"
const LEFT = "left"
const RIGHT = "right"
const CANCEL = "cancel"

const constMap = {
    0: "EMPTY",
    1: "WALL",
    4: "ROCK",
    6: "HOLE",
    9: "HERO",
    2: "_PUSH",
    3: "_IS",
    5: "_ROCK",
    11: "_WALL",
    7: "_HOLE",
    8: "EMPTY1",
    10: "_WIN",
    12: "_STOP",
    13: "_DEAD",
    14: "DEAD",
    15: "FLAG",
    16: "_FLAG",
    17: "_YA",
    18: "_HERO",
    19: "KEY",
    20: "_KEY",
    _: null
}

let activeRules = []
let alwaysPushables = [_WALL, _IS, _STOP, _ROCK, _HOLE, _PUSH, _WIN, _HERO, _FLAG, _YA, FLAG, _KEY, KEY, _DEAD]
let pushables = [...alwaysPushables]
let stoppers = []
let winners = []
let heroes = []
let soulKeepers = []
let killers = []
let story = []
let keys = {}

let grid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 11, HERO, 0, HERO, 0, 0, 0, 1, 0, 0, 1, ROCK, 0, 1],
    [1, DEAD, 0, 1, 1, 0, 3, 0, 1, 0, 0, 1, _IS, 0, 1],
    [1, 0, 0, 1, 5, 0, 4, 0, 1, 0, 0, 1, _STOP, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 2, 4, 2, 3, 2, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 6, 10, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 7, 0, 11, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, DEAD, _IS, _DEAD, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, _HOLE, _IS, HOLE, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, _WALL, _IS, _STOP, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
let currentLevel = 0
async function nextLevel() {
    //cancelAnimationFrame(raf)
    currentLevel++
    await loadLDTK()
}
async function loadLDTK() {
    /*
    A list of all values in the IntGrid layer, 
    stored from left to right, and top to bottom 
    (ie. first row from left to right, followed by second row, etc). 
    0 means "empty cell" and IntGrid values start at 1. 
    This array size is __cWid x __cHei cells.
    */
    await fetch("assets/maps.ldtk")
        .then(response => response.json())
        .then(data => {
            let levels = data.levels
            if (currentLevel > levels.length - 1) {
                currentLevel = 0
            }
            let level = data.levels[currentLevel].layerInstances[1]
            let lw = level.__cWid
            let lh = level.__cHei
            canvas.width = lw * ts
            canvas.height = lh * ts
            let gsize = level.__gridSize
            let csv = data.levels[currentLevel].layerInstances[1].intGridCsv
            let i = 0
            grid = []
            story = []
            for (let y = 0; y < lh; y++) {
                grid[y] = new Array(lh)
                for (let x = 0; x < lw; x++) {
                    grid[y][x] = csv[i++]
                }
            }
            grid = transpose(grid)
            console.log(grid)
            cancelAnimationFrame(raf)
            render()
        })

}
// flip 2d array x<>y
function transpose(matrix) {
    //if (!matrix) return
    const rows = matrix.length,
        cols = matrix[0].length;
    let _grid = [];
    for (let j = 0; j < cols; j++) {
        _grid[j] = Array(rows);
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            _grid[j][i] = matrix[i][j];
        }
    }
    return _grid;
}
loadLDTK()

class Hero {
    constructor(cx, cy) {
        this.cx = cx
        this.cy = cy
        this.rx = 0
        this.ry = 0
        this.recurse = 0
        this.maxPush = 5
    }
    update() {
        if (CoolDown.get('gameOver') || CoolDown.get('nextLevel')) return
            //console.log('updating')
        if (keys['KeyW'] == true) {
            this.toDo(UP)
                //keys['KeyW'] = false
        }
        if (keys['KeyS']) {
            this.toDo(DOWN)
                //keys['KeyS'] = false
        }
        if (keys['KeyA']) {
            this.toDo(LEFT)
                //keys['KeyA'] = false
        }
        if (keys['KeyD']) {
            this.toDo(RIGHT)
                //keys['KeyD'] = false
        }
        if (keys['KeyQ']) {
            this.toDo(CANCEL)
                //keys['KeyQ'] = false
        }

    }
    toDo(action) {
        console.log('toDo', action)
        this.recurse = 0
        switch (action) {

            case UP:
                this.test(this.cx, this.cy - 1, {
                    x: 0,
                    y: -1
                }) ? swap(this.cx, this.cy, this.cx, this.cy - 1) : 0
                break
            case DOWN:
                this.test(this.cx, this.cy + 1, {
                    x: 0,
                    y: 1
                }) ? swap(this.cx, this.cy, this.cx, this.cy + 1) : 0
                break
            case LEFT:
                this.test(this.cx - 1, this.cy, {
                    x: -1,
                    y: 0
                }) ? swap(this.cx, this.cy, this.cx - 1, this.cy) : 0
                break
            case RIGHT:
                this.test(this.cx + 1, this.cy, {
                    x: 1,
                    y: 0
                }) ? swap(this.cx, this.cy, this.cx + 1, this.cy) : 0
                break
            default:
        }
        //story.push(JSON.parse(JSON.stringify(grid)));
    }
    test(x, y, dir) {
        if (x < 0 || x > grid.length - 1 || y < 0 || y > grid.length - 1) {
            console.log('escaping test')
            return false
        }
        // return true if empty then swapping
        if (grid[x][y] == 0) {
            story.push(JSON.parse(JSON.stringify(grid)));
            return true
        }
        if (killers.includes(grid[x][y]) && soulKeepers.includes(grid[x - dir.x][y - dir.y])) {
            story.push(JSON.parse(JSON.stringify(grid)));
            if (gridHas(grid[x - dir.x][y - dir.y]) > 1) {
                soulKeepers = []
                grid[x - dir.x][y - dir.y] = 0

                return 0
            } else {
                grid[x - dir.x][y - dir.y] = 0
                if (!CoolDown.get('gameOver')) {
                    new CoolDown("gameOver", 180, () => { clearGrid(DEAD) })
                }
                return 0
            }
        }
        //test of wining

        if (winners.includes(grid[x][y]) && soulKeepers.includes(grid[x - dir.x][y - dir.y]) && !CoolDown.get('nextLevel')) {
            clearGrid()
            new CoolDown("nextLevel", 60 * 4, nextLevel)
            return 0
        }

        //if (grid[x][y] == 1) return stoppers.includes(WALL) ? false : 0
        if (grid[x][y] > 0 && isPushable(grid[x][y])) {
            if (this.test(x + dir.x, y + dir.y, dir) == true) {
                this.recurse++

                    console.log(this.recurse, 'recursions level')
                swap(x + dir.x, y + dir.y, x, y, false)
                story.push(JSON.parse(JSON.stringify(grid)));
                //console.log(story)
                if (this.recurse == this.maxPush) {
                    for (let i = 0; i < this.recurse + 1; i++) {
                        console.log(i, 'cancelling')
                        grid = story.pop()
                    }
                    return false
                }
                return true
            }
        }
        console.log('testing N??', this.recurse, x, y, grid[x][y])
        return false
    }
}

function transformGrid(a, b) {
    for (let y = 0; y < grid[0].length; y++) {
        for (let x = 0; x < grid.length; x++) {
            if (grid[x][y] == a) {
                grid[x][y] = b
            }
        }
    }
}

function drawGrid() {
    if (!grid) return
    heroes = []
    if (frames % 8 == 0) {
        _offset++
        if (_offset > 3) { _offset = 0 }
    }
    for (let y = 0; y < grid[0].length; y++) {
        for (let x = 0; x < grid.length; x++) {
            let tile = grid[x][y]
            let mess = null
            let img = null

            if (soulKeepers.includes(tile)) {
                heroes.push(new Hero(x, y))
            }

            if (tile == 0) {
                c.fillStyle = '#aaa'

            }
            if (tile == 1) {
                c.fillStyle = 'black'
                mess = "WALL"
                img = { x: 0, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 2) {
                c.fillStyle = 'grey'
                mess = "PUSH"
                img = { x: 1, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 3) {
                c.fillStyle = 'orange'
                mess = "_IS"
                img = { x: 2, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 4) {
                c.fillStyle = 'brown'
                mess = "ROCK"
                img = { x: 1, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 5) {
                c.fillStyle = 'brown'
                mess = "_ROCK"
                img = { x: 5, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 6) {
                c.fillStyle = 'blue'
                mess = "HOLE"
                img = { x: 2, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 7) {
                c.fillStyle = 'dark_blue'
                mess = "_HOLE"
                img = { x: 6, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 9) {
                c.fillStyle = 'green'
                mess = "BOBO"
                img = { x: 0, y: 0, sx: 32, sy: 32 }

                //heroes.push(new Hero(x, y))
            }
            if (tile == 10) {
                c.fillStyle = 'yellow'
                mess = "_WIN"
                img = { x: 3, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 11) {
                c.fillStyle = 'pink'
                mess = "_WALL"
                img = { x: 4, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 12) {
                c.fillStyle = 'dark_green'
                mess = "_STOP"
                img = { x: 7, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 13) {
                c.fillStyle = 'black'
                mess = "_DEAD"
                img = { x: 4, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 14) {
                c.fillStyle = 'black'
                mess = "DEAD"
                img = { x: 3, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 15) {
                c.fillStyle = '#ff0'
                mess = "FLAG"
                img = { x: 5, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 16) {
                c.fillStyle = '#dd0'
                mess = "_FLAG"
                img = { x: 6, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 17) {
                c.fillStyle = '#f28'
                mess = "YA"
                img = { x: 7, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 18) {
                c.fillStyle = '#f0f'
                mess = "_HERO"
                img = { x: 8, y: 0, sx: 32, sy: 32 }
            }
            if (tile == 19) {
                c.fillStyle = '#f28'
                mess = "KEY"
                img = { x: 9, y: 1, sx: 32, sy: 32 }
            }
            if (tile == 20) {
                c.fillStyle = '#f0f'
                mess = "_KEY"
                img = { x: 9, y: 0, sx: 32, sy: 32 }
            }
            c.strokeStyle = c.fillStyle

            if (img) {


                c.drawImage(sprites, img.x * img.sx, ((_offset * 2 + img.y) * img.sy), img.sx, img.sy, x * ts, y * ts, ts, ts)
            } else {
                //c.fillRect(x * ts, y * ts, ts, ts)
            }
            c.textAlign = 'center'
            if (mess == 1) {
                c.save()
                c.filter = 'brightness(0.75)'
                c.fillText(mess, x * ts + ts * 0.5, y * ts + ts * 0.5)
                c.restore()
            }


        }
    }
}
drawGrid()

function isPushable(tile) {
    return pushables.includes(tile)
}

// swap arrow function to get this from hero instances
const swap = ((x, y, x1, y1, _hero = false) => {
    console.log('swapping', grid[x][y], 'to', grid[x1][y1])
    let tg = grid[x1][y1]
    grid[x1][y1] = grid[x][y]
    grid[x][y] = tg
    if (_hero) {
        _hero.cx = x1
        _hero.cy = y1
    }
    console.log('swapped', grid[x][y], 'to', grid[x1][y1])
})

function clearGrid(tile = _WIN) {

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            grid[x][y] = tile
        }
    }
}

function gridHas(_tile) {
    let p = 0
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            if (grid[x][y] == _tile) {
                p++
            }
        }
    }
    return p
}

function checkRules() {
    if (CoolDown.get('gameOver') || CoolDown.get('nextLevel')) return
    activeRules = []
    pushables = [...alwaysPushables]
    stoppers = []
    winners = []
    killers = []
    soulKeepers = []
    let hasBobo = false
    let hasSoul = false
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            let tile = grid[x][y]
            if (grid[x][y] == HERO) {
                hasBobo = true
            }
            if (grid[x + 2] == undefined) continue
            if (grid[x][y + 2] == undefined) continue


            //BOBO IS YA
            if (tile == _HERO) {
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _YA) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _YA)) {
                    hasSoul = true
                    if (!activeRules.includes('BOBO IS YA')) {
                        activeRules.push('BOBO IS YA')
                        soulKeepers.push(HERO)
                    }
                }
            }

            // ALL IS YA
            if ([_WALL, _FLAG, _KEY, _HOLE, _ROCK, _DEAD].includes(tile)) {
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _YA) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _YA)) {

                    if (gridHas(eval(constMap[tile].substring(1))) && !activeRules.includes(constMap[tile].substring(1) + ' IS YA')) {
                        activeRules.push(constMap[tile].substring(1) + ' IS YA')
                        soulKeepers.push(eval(constMap[tile].substring(1)))
                        hasSoul = true
                    }
                }
            }

            // ALL IS WIN
            if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _WIN) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _WIN)) {
                tile = grid[x][y]
                if ([_FLAG, _WALL, _ROCK, _HERO, _HOLE, _DEAD, _KEY].includes(tile)) {
                    let tileName = constMap[tile].substring(1).toLowerCase()
                    let unscoredTile = eval(constMap[tile].substring(1))
                        // ERROR "PUSH is undefined at eval : attendu _PUSH..."

                    if (!winners.includes(unscoredTile) && !activeRules.includes(tileName + ' is win')) {
                        activeRules.push(tileName + ' is win')
                        winners.push(unscoredTile)

                        console.log(tileName + " IS WIN")
                    }
                }
            }

            // ALL IS ALL (but !_IS !_WIN)
            if ([_WALL, _ROCK, _HOLE, _HERO, _FLAG, _KEY, _DEAD].includes(tile)) {

                if (grid[x + 1][y] == _IS && [_KEY, _WALL, _ROCK, _HOLE, _HERO, _FLAG].includes(grid[x + 2][y])) {
                    let isWhat = constMap[grid[x + 2][y]].substring(1)
                    let tileName = constMap[eval(constMap[tile])].substring(1) // turning _XXX to XXX
                    if (!activeRules.includes(tileName + ' is ' + isWhat) && tileName != isWhat) {
                        activeRules.push(tileName.toLowerCase() + ' is ' + isWhat.toLowerCase())
                        transformGrid(eval(tileName), eval(isWhat))
                        console.log(tileName + ' is ' + isWhat)
                    }

                }
                if (grid[x][y + 1] == _IS && [_KEY, _WALL, _ROCK, _HOLE, _HERO, _FLAG].includes(grid[x][y + 2])) {
                    let isWhat = constMap[grid[x][y + 2]].substring(1)
                    let tileName = constMap[eval(constMap[tile])].substring(1) // turning _XXX to XXX
                    if (!activeRules.includes(tileName + ' is ' + isWhat) && tileName != isWhat) {
                        activeRules.push(tileName.toLowerCase() + ' is ' + isWhat.toLowerCase())
                        transformGrid(eval(tileName), eval(isWhat))
                        console.log(tileName + ' is ' + isWhat)
                    }

                }
            }

            // ALL IS PUSH
            // ALL IS PUSH
            if ([_WALL, _HOLE, _ROCK, _KEY, _FLAG, _DEAD].includes(tile)) {
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _PUSH) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _PUSH)) {
                    let tileName = constMap[eval(constMap[tile])].substring(1)
                    if (!activeRules.includes(tileName.toLowerCase() + ' is push')) {
                        activeRules.push(tileName.toLowerCase() + ' is push')
                        if (!pushables.includes(eval(constMap[tile].substring(1)))) {
                            pushables.push(eval(constMap[tile].substring(1)))
                        }
                    }
                }
            }


            // ALL IS DEATH 
            tile = grid[x][y]
                //if (!grid[x + 2]) continue
                //if (!grid[x][y + 2]) continue
            if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _DEAD) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _DEAD)) {

                if (!killers.includes(constMap[tile].substring(1)) && [_HOLE, _WALL, _DEAD, _ROCK, _KEY, _FLAG, _HERO, ].includes(tile)) {
                    let tileName = constMap[tile].toLowerCase()
                    if (!activeRules.includes(tileName + ' is death')) {
                        activeRules.push(tileName.substring(1) + ' is death')
                        killers.push(eval(constMap[tile].substring(1)))

                        //console.log(tileName + " is death")
                    }
                }
            }


            // ROCK
            if (grid[x][y] == ROCK || grid[x][y] == _ROCK) {
                // ROCK IS PUSH
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _PUSH) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _PUSH)) {
                    if (!activeRules.includes('rock is push')) {
                        pushables.push(ROCK)
                        activeRules.push('rock is push')
                            //console.log("ROCK IS PUSH")
                    }
                }
                // ROCK IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('rock is stop')) {
                        stoppers.push(ROCK)
                        activeRules.push('rock is stop')
                            //console.log("ROCK IS STOP")
                    }
                }
            }
            // WALL
            if (grid[x][y] == _WALL) {
                // WALL IS PUSH
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _PUSH) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _PUSH)) {
                    if (!activeRules.includes('wall is push')) {
                        pushables.push(WALL)
                        activeRules.push('wall is push')
                            //console.log("WALL IS PUSH")
                    }
                }
                // WALL IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('wall is stop')) {
                        stoppers.push(WALL)
                        activeRules.push('wall is stop')
                            //console.log("WALL IS STOP")
                    }
                }
            }
            // HOLE
            if (grid[x][y] == _HOLE) {
                // HOLE IS PUSH
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _PUSH) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _PUSH)) {
                    if (!activeRules.includes('hole is push')) {
                        pushables.push(HOLE)
                        activeRules.push('hole is push')
                            //console.log("HOLE IS PUSH")
                    }
                }
                // HOLE IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('hole is stop')) {
                        stoppers.push(HOLE)
                        activeRules.push('hole is stop')
                            //console.log("HOLE IS STOP")
                    }
                }
            }
        }
    }

    // CHECKING IF YA T IL TOUJOURS UN PILOTE DANS LA VION

    if (soulKeepers.length == 0) { // hasBobo == false) { // || 
        if (!CoolDown.get('gameOver')) {
            new CoolDown("gameOver", 180, () => { clearGrid(DEAD) })
        }
    }

    if (soulKeepers.length == 1 && gridHas(soulKeepers[0]) == 0) {
        console.log('no one is left')
        if (!CoolDown.get('gameOver')) {
            new CoolDown("gameOver", 180, () => { clearGrid(DEAD) })
        }
    }
    if (!hasSoul) {
        if (!CoolDown.get('gameOver')) {
            new CoolDown("gameOver", 180, () => { clearGrid(DEAD) })
        }
        let allKilled = 0
        for (i in soulKeepers) {
            if (gridHas(soulKeepers[i]) == 0) {
                console.log(constMap(soulKeepers[i]), 'are dead')
                allKilled++
            }
        }
        if (allKilled >= soulKeepers.length) {
            if (!CoolDown.get('gameOver')) {
                new CoolDown("gameOver", 180, () => { clearGrid(DEAD) })
            }
        }
    }


}
let masterKeys = {}
window.addEventListener('keydown', function(e) {
    //console.log('pressed', e.code)
    keys[e.code] = true
    masterKeys[e.code] = true
})
window.addEventListener('keyup', function(e) {
    //console.log('released', e.code)
    keys[e.code] = false
    masterKeys[e.code] = false
})

function goFullScreen() {
    var canvas = document.getElementById("vp");
    if (canvas.requestFullScreen)
        canvas.requestFullScreen();
    else if (canvas.webkitRequestFullScreen)
        canvas.webkitRequestFullScreen();
    else if (canvas.mozRequestFullScreen)
        canvas.mozRequestFullScreen();
}
window.addEventListener('dblclick', function(e) {
    goFullScreen()
})
window.addEventListener('mousedown', function(e) {
    if (masterKeys['ControlLeft'] == true) {
        e.preventDefault()
        if (e.button == 0) {
            let x = Math.floor((e.pageX / ts))
            let y = Math.floor((e.pageY / ts))
            let val = grid[x][y]
            if (val > 20) {
                val = 0
            } else { val++; }
            grid[x][y] = val
        } else {
            let x = Math.floor((e.pageX / ts))
            let y = Math.floor((e.pageY / ts))
            grid[x][y] = 0
        }
    }
})
let cds = []
class CoolDown {
    constructor(name, timer, cb) {
        this.name = name
        this.timeout = timer
        this.cb = cb
        this.startFrame = frames
        cds.push(this)
        return this
    }
    static get(name) {
        let cd = cds.filter((a) => { return a.name == name })[0]
            //console.log(cd)
        if (cd) return cd
        return 0
    }
    reset() {
        this.startFrame = frames
    }
    update(dt) {
        if (frames - this.startFrame > this.timeout) {
            this.cb()
            cds = cds.filter((a) => a.name != this.name)
            delete this.cb
        }
    }
}

function render(t = 0) {
    frames++
    if (keys['KeyL'] == true) { nextLevel() }
    if (keys['KeyQ'] == true) {
        cds = []
            //story.push(JSON.parse(JSON.stringify(grid)));
        if (story.length > 0) {
            grid = JSON.parse(JSON.stringify(story.pop()))
            for (let x = 0; x < grid.length; x++) {
                for (let y = 0; y < grid.length; y++) {
                    /*if (grid[x][y] == 9) {
                        this.cx = x;
                        this.cy = y
                    }*/
                }
            }
        } else {
            console.log('cant cancel story')
        }
    }

    c.save()
    c.fillStyle = "#333"
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.restore()
    checkRules() // reset all arrays ;)
    cds.forEach(cd => {
        cd.update(t)
    })
    heroes.forEach((h) => {
        h.update()
    })
    keys = {}
    drawGrid()
    for (let i in activeRules) {
        c.save()
        c.fillStyle = "#ff0"
        c.font = "16px sans-serif"
        c.textAlign = 'left'
        c.fillText(activeRules[i], 16, 16 + 16 * i)
        c.restore()
    }
    raf = requestAnimationFrame(render)
}
//render()


//let rules = [4, 3, 2] // rock is push
function toCanvasCoords(pageX, pageY, scale) {
    var rect = canvas.getBoundingClientRect();
    let x = (pageX - rect.left) / scale;
    let y = (pageY - rect.top) / scale;
    return { x, y };
}

function toScreenCoords(x, y, scale) {
    var rect = canvas.getBoundingClientRect();
    let wx = x * scale + rect.left + scrollElement.scrollLeft;
    let wy = y * scale + rect.top + scrollElement.scrollTop;
    return { wx, wy };
}