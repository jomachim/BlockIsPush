let canvas = vp
let c = canvas.getContext('2d')

let sprites = new Image()
sprites.src = './assets/spritesheet.png'

let ts = 32
let start = {
    x: 2,
    y: 2
}
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
const UP = "up"
const DOWN = "down"
const LEFT = "left"
const RIGHT = "right"
const CANCEL = "cancel"

const constMap = {
    1: "WALL",
    4: "ROCK",
    6: "HOLE",
    9: "HERO",
    2: "_PUSH",
    3: "_IS",
    5: "_ROCK",
    11: "_WALL",
    7: "_HOLE",
    10: "_WIN",
    12: "_STOP",
    _: null
}

let grid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 11, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, _ROCK, 0, 1],
    [1, 0, 9, 1, 1, 0, 3, 0, 1, 0, 0, 1, _IS, 0, 1],
    [1, 0, 0, 1, 5, 0, 4, 0, 1, 0, 0, 1, _STOP, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 2, 4, 2, 3, 2, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 6, 10, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 7, 0, 11, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, _HOLE, _IS, HOLE, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, _WALL, _IS, _STOP, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
drawGrid()

let activeRules = []
let alwaysPushables = [_WALL, _IS, _STOP, _ROCK, _HOLE, _PUSH, _WIN]
let pushables = [...alwaysPushables]
let stoppers = []
let winners = []







function drawGrid() {
    if (!grid) return
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            let tile = grid[x][y]
            let mess = null
            let img = null
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

            c.strokeStyle = c.fillStyle

            if (img) {
                c.drawImage(sprites, img.x * img.sx, img.y * img.sy, img.sx, img.sy, x * ts, y * ts, ts, ts)
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
let story = []
let keys = {}
class Hero {
    constructor(cx, cy) {
        this.cx = cx
        this.cy = cy
        this.rx = 0
        this.ry = 0
        this.recurse = 0
        this.maxPush = 4
    }
    update() {
        //console.log('updating')
        if (keys['KeyW'] == true) {
            this.toDo(UP)
            keys['KeyW'] = false
        }
        if (keys['KeyS']) {
            this.toDo(DOWN)
            keys['KeyS'] = false
        }
        if (keys['KeyA']) {
            this.toDo(LEFT)
            keys['KeyA'] = false
        }
        if (keys['KeyD']) {
            this.toDo(RIGHT)
            keys['KeyD'] = false
        }
        if (keys['KeyQ']) {
            this.toDo(CANCEL)
            keys['KeyQ'] = false
        }

    }
    toDo(action) {
        console.log('toDo', action)
        this.recurse = 0
        switch (action) {
            case CANCEL:
                //story.push(JSON.parse(JSON.stringify(grid)));
                if (story.length > 0) {
                    grid = JSON.parse(JSON.stringify(story.pop()))
                    for (let x = 0; x < grid.length; x++) {
                        for (let y = 0; y < grid.length; y++) {
                            if (grid[x][y] == 9) {
                                hero.cx = x;
                                hero.cy = y
                            }
                        }
                    }
                } else {
                    console.log('cant cancel story')
                }
                break
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

        //test of wining

        if (winners.includes(grid[x][y])) {
            clearGrid()
            return
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
        console.log('testing N°', this.recurse, x, y, grid[x][y])
        return false
    }
}


function isPushable(tile) {
    return pushables.includes(tile)
}

function swap(x, y, x1, y1, _hero = true) {
    console.log('swapping', grid[x][y], 'to', grid[x1][y1])
    let tg = grid[x1][y1]
    grid[x1][y1] = grid[x][y]
    grid[x][y] = tg
    if (_hero) {
        hero.cx = x1
        hero.cy = y1
    }
    console.log('swapped', grid[x][y], 'to', grid[x1][y1])
}

function clearGrid() {
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            grid[x][y] = _WIN
        }
    }
}



function checkRules() {
    activeRules = []
    pushables = [...alwaysPushables]
    stoppers = []
    winners = []
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {

            // ALL IS WIN
            let tile = grid[x][y]
            if (!grid[x + 2]) continue
            if (!grid[x][y + 2]) continue
            if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _WIN) || (grid[x][y + 1] == _IS && grid[x][y + 2] == _WIN)) {
                let tileName = constMap[tile].substring(1).toLowerCase()
                let unscoredTile = eval(constMap[tile].substring(1))
                if (!winners.includes(unscoredTile) && alwaysPushables.includes(tile)) {
                    // ERROR "PUSH is undefined at eval : attendu _PUSH..."
                    if (!activeRules.includes(tileName + ' is win')) {
                        activeRules.push(tileName + ' is win')
                        winners.push(unscoredTile)

                        console.log(tileName + " IS WIN")
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
                        console.log("ROCK IS PUSH")
                    }
                }
                // ROCK IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('rock is stop')) {
                        stoppers.push(WALL)
                        activeRules.push('rock is stop')
                        console.log("ROCK IS STOP")
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
                        console.log("WALL IS PUSH")
                    }
                }
                // WALL IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('wall is stop')) {
                        stoppers.push(WALL)
                        activeRules.push('wall is stop')
                        console.log("WALL IS STOP")
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
                        console.log("HOLE IS PUSH")
                    }
                }
                // HOLE IS STOP
                if ((grid[x + 1][y] == _IS && grid[x + 2][y] == _STOP) ||
                    (grid[x][y + 1] == _IS && grid[x][y + 2] == _STOP)) {
                    if (!activeRules.includes('hole is stop')) {
                        stoppers.push(HOLE)
                        activeRules.push('hole is stop')
                        console.log("HOLE IS STOP")
                    }
                }
            }
        }
    }
}

window.addEventListener('keydown', function(e) {
    //console.log('pressed', e.code)
    keys[e.code] = true
})
window.addEventListener('keyup', function(e) {
    //console.log('released', e.code)
    keys[e.code] = false
})
window.addEventListener('mousedown', function(e) {
    if (keys['ControlLeft']) {
        e.preventDefault()
        if (e.button == 0) {
            let x = Math.floor((e.pageX / ts))
            let y = Math.floor((e.pageY / ts))
            let val = grid[x][y]
            val > 12 ? val = 0 : val++;
            grid[x][y] = val
        } else {
            let x = Math.floor((e.pageX / ts))
            let y = Math.floor((e.pageY / ts))
            grid[x][y] = 0
        }
    }
})
let hero = new Hero(start.x, start.y)

function render(t = 0) {
    c.save()
    c.fillStyle = "#333"
    c.fillRect(0, 0, 800, 600)
    c.restore()
    checkRules()
    hero.update()
    drawGrid()
    for (let i in activeRules) {
        c.save()
        c.fillStyle = "#ff0"
        c.fillText(activeRules[i], 600 - 64, 16 + 16 * i)
        c.restore()
    }
    requestAnimationFrame(render)
}
render()


let rules = [4, 3, 2] // rock is push