import { 
    vectorHelper, 
    mapToCamX, 
    mapToCamY, 
    drawCircle, 
    drawLine, 
    EuDistance, 
    drawName,
    drawRect,
    drawProgress,
    calculateCurscore,
} from "./helpers.js"


export class Map {
    constructor (ctx, width, height, wtTeam, bkTeam) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.wtTeam = wtTeam
        this.bkTeam = bkTeam
        this.gridGap = 100
    }

    mapRestrict(moveobj) {
        if (moveobj.x < 0) moveobj.x = 0
        if (moveobj.x > this.width) moveobj.x = this.width
        if (moveobj.y < 0) moveobj.y = 0
        if (moveobj.y > this.height) moveobj.y = this.height
    }

    detectOut(moveobj) {
        return (moveobj.x < 0 || 
               moveobj.x > this.width || 
               moveobj.y < 0 || 
               moveobj.y > this.height)
    }

    draw(cam,canvas,percentage) {
        let rgbLst = [80, 80, 80]
        // draw grid
        for (let i = 0; i < this.width; i+=this.gridGap) {
            drawLine(this.ctx, i, 0, i, this.height, 1, [200, 200, 200], cam)
        }
        for (let i = 0; i < this.height; i+=this.gridGap) {
            drawLine(this.ctx, 0, i, this.width, i, 1, [200, 200, 200], cam)
        }
        // draw boundary
        drawRect(this.ctx, 0, 0, this.width, this.height, 14, [255, 0, 0], cam)
        // draw bases
        drawCircle(
            this.ctx,
            this.wtTeam.base.x,
            this.wtTeam.base.y,
            this.wtTeam.base.r,
            this.wtTeam.supCol.map((a, i) => a + rgbLst[i]),
            cam,
        )
        drawCircle(
            this.ctx,
            this.bkTeam.base.x,
            this.bkTeam.base.y,
            this.bkTeam.base.r,
            this.bkTeam.supCol.map((a, i) => a + rgbLst[i]),
            cam,
        )
        drawProgress(this.ctx,canvas,percentage)
    }
}


export class Camera {
    constructor (ctx, width, height, focus) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.centerX = focus.x
        this.centerY = focus.y
        this.focus = focus
    }

    update() {
        this.centerX = this.focus.x
        this.centerY = this.focus.y
    }
}


class Moveobj {
    constructor(ctx, x, y, r, col, v) {
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.col = col
        this.v = v
    }

    draw(cam) {
        //drawGradientCircle(this.ctx, this.x, this.y, 3, 12, 'red', 'white', cam)
        drawCircle(this.ctx, this.x, this.y, this.r+3, [255, 100, 100], cam)
        drawCircle(this.ctx, this.x, this.y, this.r, this.col, cam)
    }

    update(cam) {
        this.draw(cam)
        this.x += this.v.x
        this.y += this.v.y
    }

    detectEntity(obj) {
        const distance = EuDistance(this.x,this.y,obj.x,obj.y)
        if (distance <= (this.r + obj.r)) {
            return true
        }
        return false
    }
}


class Bullet extends Moveobj {
    constructor(ctx, x, y, r, col, v, char) {
        super(ctx, x, y, r, col, v)
        this.char = char
    }

    draw(cam) {
        //drawGradientCircle(this.ctx, this.x, this.y, 3, 12, 'red', 'white', cam)
        drawCircle(this.ctx, this.x, this.y, this.r+3, this.char.team.supCol, cam)
        drawCircle(this.ctx, this.x, this.y, this.r, this.col, cam)
    }

    shoot(obj) {
        if (this.detectEntity(obj) && this.col[0] != obj.col[0]) {
            var i = 0
            while (i<3) {
                if(this.col[i]<obj.col[i]){
                    obj.col[i] = obj.col[i]-10
                }else{
                    obj.col[i] = obj.col[i]+10
                }
                i = i+1
            }
            return true
        }
        return false
    }
}


class Character extends Moveobj {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name, team) {
        super(ctx, x, y, r, col, v)
        this.bulletV = bulletV
        this.vVal = vVal
        this.name = name
        this.team = team
    }

    draw(cam) {
        //drawGradientCircle(this.ctx, this.x, this.y, 20, 35, 'red', 'white', cam)
        drawCircle(this.ctx, this.x, this.y, this.r+4, this.team.supCol, cam)
        drawCircle(this.ctx, this.x, this.y, this.r, this.col, cam)
        const vector = vectorHelper(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.curX, this.curY, this.r)
        const x2 = this.x + vector.x
        const y2 = this.y + vector.y
        drawLine(this.ctx, this.x, this.y, x2, y2, 5, this.team.supCol, cam)
        drawName(this.ctx, this, cam, this.team.supCol)
    }

    recover() {
        // if character is at its team base, its own color will be purified
        if (this.team.id == 0 && 
            this.col[0] < this.team.teamCol[0] && 
            EuDistance(this.x, this.y, this.team.base.x, this.team.base.y) < 
            this.team.base.r - this.r
        ) {
            this.col = this.col.map((a, i) => a + [1, 1, 1][i])
        }
        if (this.team.id == 1 && 
            this.col[0] > this.team.teamCol[0] && 
            EuDistance(this.x, this.y, this.team.base.x, this.team.base.y) < 
            this.team.base.r - this.r
        ) {
            this.col = this.col.map((a, i) => a - [1, 1, 1][i])
        }
    }

    update(cam) {
        this.draw(cam)
        this.recover()
        this.x += this.v.x
        this.y += this.v.y
    }

    bounceback(obj, solid=false) {
        // do math
        let a = obj.x - this.x
        let b = obj.y - this.y
        let l = (a**2 + b**2)**(1/2)
        let l2 = (this.r + obj.r - l)/2
        let x = a*l2/l
        let y = b*l2/l
        if (solid) {
            obj.x += x*2
            obj.y += y*2
        } else {
            this.x -= x
            this.y -= y
            obj.x += x
            obj.y += y
        }
    }
}


class Tower extends Character {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name, team) {
        super(ctx, x, y, r, col, v, bulletV, vVal, name, team)
    }

    draw(cam) {
        drawCircle(this.ctx, this.x, this.y, this.r+6, this.team.supCol, cam)
        drawCircle(this.ctx, this.x, this.y, this.r, this.col, cam)
        // inner ring
        drawCircle(this.ctx, this.x, this.y, this.r-10, this.team.supCol, cam)
        drawCircle(this.ctx, this.x, this.y, this.r-20, this.col, cam)
        // inner circle
        drawCircle(this.ctx, this.x, this.y, 40, this.team.supCol, cam)
    }
}


class Player extends Character {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name, team) {
        super(ctx, x, y, r, col, v, bulletV, vVal, name, team)
        this.curX = 0
        this.curY = 0
        this.w = false
        this.s = false
        this.a = false
        this.d = false
    }

    update(cam) {
        this.draw(cam)
        if (this.w) this.y -= this.v.y
        if (this.s) this.y += this.v.y
        if (this.a) this.x -= this.v.x
        if (this.d) this.x += this.v.x
    }
}


export class Bot extends Character {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name, team) {
        super(ctx, x, y, r, col, v, bulletV, vVal, name, team)
        this.curX = 0
        this.curY = 0
        this.tarX = 0
        this.tarY = 0
    }

    update(cam) {
        this.draw(cam)
        this.v = {x: 0, y: 0}
        this.x += this.v.x
        this.y += this.v.y
    }

    move(newx,newy) {
        this.x = newx
        this.y = newy
    }

    vision(game) {
        var botlist = game.cLst
        var player = game.player
        var messageList = [[this.x,this.y,player.x,player.y]]
        for(let i in botlist) {
            if(botlist[i].team.id != this.team.id) {
                messageList.push([this.x,this.y,i.x,i.y])
            }
        }
        var npos1 = [this.x+1,this.y]
        var npos2 = [this.x-1,this.y]
        var npos3 = [this.x,this.y+1]
        var npos4 = [this.x,this.y-1]
        var nearest
        var distance = Infinity
        for(let key in messageList){
            var rd = EuDistance(messageList[key][0],messageList[key][1],messageList[key][2],messageList[key][3])
            if(distance > rd){
                distance = rd
                nearest = [messageList[key][2],messageList[key][3]]
            }
        }
        this.tarX = nearest[0]
        this.tarY = nearest[1]
        
        distance = Infinity
        var nextpositon 
        var positionarray = [npos1,npos2,npos3,npos4]
        for(let a in positionarray) {
            var d = EuDistance(nearest[0],nearest[1],positionarray[a][0],positionarray[a][1])
            if(distance > d){
                distance = d
                nextpositon = positionarray[a]
            }
        }
        return nextpositon
    }

    behave(game){
        var nextposition = this.vision(game)
        this.move(nextposition[0],nextposition[1])
    }
}


function botFactory(num, ctx, team) {
    const botLst = []
    for (let i = 0; i < num; i++) {
        botLst.push(
            new Bot(
                ctx,
                team.base.x + (Math.random()-0.5)*2*team.base.r,
                team.base.y + (Math.random()-0.5)*2*team.base.r,
                26,
                team.teamCol.slice(),
                {x: 0, y: 0},
                3,
                7,
                `Bot ${i}`,
                team,
            )
        )
    }
    return botLst
}


export class Game {
    constructor(ctx, canvas, mapWidth, mapHeight) {
        this.ctx = ctx
        this.canvas = canvas
        // Identification Aura of different teams
        const wtTeam = {
            id: 0,
            teamCol: [255, 255, 255],
            supCol: [100, 100, 255],
            base: {
                x: 400,
                y: 400,
                r: 300
            },
        }
        const bkTeam = {
            id: 1,
            teamCol: [0, 0, 0],
            supCol: [255, 100, 100],
            base: {
                x: mapWidth-400,
                y: mapHeight-400,
                r: 300
            },
        }
        const noTeam = {
            id: 2,
            teamCol: [127, 127, 127],
            supCol: [154, 205, 50],
            base: null,
        }
        // game elements
        this.map = new Map(ctx, mapWidth, mapHeight, wtTeam, bkTeam)
        this.cLst = botFactory(8, ctx, bkTeam).concat(botFactory(8, ctx, wtTeam))
        // randomly allocate player's team
        let wtRebirthRange = {
            x: wtTeam.base.x + (Math.random()-0.5)*2*wtTeam.base.r,
            y: wtTeam.base.y + (Math.random()-0.5)*2*wtTeam.base.r,
        }
        let bkRebirthRange = {
            x: bkTeam.base.x + (Math.random()-0.5)*2*bkTeam.base.r,
            y: bkTeam.base.y + (Math.random()-0.5)*2*bkTeam.base.r,
        }
        if (Math.random() > 0.5) {
            this.player = new Player(
                ctx, wtRebirthRange.x, wtRebirthRange.y, 26, wtTeam.teamCol, {x: 2, y: 2}, 7, 7, 'Luke', wtTeam
            )
            this.cLst[this.cLst.length-1] = this.player
        } else {
            this.player = new Player(
                ctx, bkRebirthRange.x, bkRebirthRange.y, 26, bkTeam.teamCol, {x: 2, y: 2}, 7, 7, 'Luke', bkTeam
            )
            this.cLst[0] = this.player
        }
        this.camera = new Camera(ctx, canvas.width, canvas.height, this.player)
        this.bulletLst = []
        // initialize towers
        this.towerlst = []
        for (let i = 0; i < 3; i++) {
            this.towerlst.push(
                new Tower(
                    ctx, 
                    (mapWidth/4)*(i+1), 
                    (mapHeight/4)*(3-i), 
                    120, 
                    noTeam.teamCol.slice(), 
                    {x: 0, y: 0}, 
                    7, 
                    7, 
                    `objective ${i+1}`,
                    noTeam,
                )
            )
        }
    }

    shootBullet(character, camX, camY) {
        this.bulletLst.push(
            new Bullet(
                this.ctx,
                character.x, 
                character.y, 
                8, 
                character.col, 
                vectorHelper(
                    mapToCamX(character.x, this.camera),
                    mapToCamY(character.y, this.camera),
                    camX,
                    camY,
                    character.bulletV
                ),
                character,
            )
        )
    }
}
