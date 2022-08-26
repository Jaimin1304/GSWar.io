import { 
    vectorHelper, mapToCamX, mapToCamY, colArrToStr, drawCircle, drawLine, drawGradientCircle,EuDistance,drawName
} from "./helpers.js"


export class Map {
    constructor (ctx, width, height) {
        this.ctx = ctx
        this.width = width
        this.height = height
    }

    detectOut(moveObj) {
        if (moveObj.x < 0) moveObj.x = 0
        if (moveObj.x > this.width) moveObj.x = this.width
        if (moveObj.y < 0) moveObj.y = 0
        if (moveObj.y > this.height) moveObj.y = this.height
    }

    draw(cam) {
        this.ctx.beginPath()
        this.ctx.lineWidth = "12"
        this.ctx.strokeStyle = "rgb(255,0,100)"
        this.ctx.rect(
            mapToCamX(0, cam), 
            mapToCamY(0, cam), 
            this.width,
            this.height,
        )
        this.ctx.stroke()
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


class MoveObj {
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
        drawCircle(this.ctx, this.x, this.y, this.r+3, 'rgb(255, 100, 100)', cam)
        drawCircle(this.ctx, this.x, this.y, this.r, colArrToStr(this.col), cam)
    }

    update(cam) {
        this.draw(cam)
        this.x += this.v.x
        this.y += this.v.y
    }

    detectEntity(Obj){
        const distance = EuDistance(this.x,this.y,Obj.x,Obj.y)


        if(distance <= (this.r + Obj.r) ){
            return true
        }

        return false
    }

    
}


class Bullet extends MoveObj {
    constructor(ctx, x, y, r, col, v) {
        super(ctx, x, y, r, col, v)
    }

    shoot(Obj){

        if(this.detectEntity(Obj)){
            var i = 0
            while(i<3){
                if(this.col[i]<Obj.col[i]){
                    Obj.col[i] = Obj.col[i]-3
                }else{
                    Obj.col[i] = Obj.col[i]+3
                }
                i = i+1
            }
            return true

        }
        return false


    }

    
}


class Character extends MoveObj {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name) {
        super(ctx, x, y, r, col, v)
        this.bulletV = bulletV
        this.vVal = vVal
        this.name = name
    }

    draw(cam) {
        //drawGradientCircle(this.ctx, this.x, this.y, 20, 35, 'red', 'white', cam)
        drawCircle(this.ctx, this.x, this.y, this.r+4, 'rgb(255, 100, 100)', cam)
        drawCircle(this.ctx, this.x, this.y, this.r, colArrToStr(this.col), cam)
        const vector = vectorHelper(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.curX, this.curY, this.r)
        const x2 = this.x + vector.x
        const y2 = this.y + vector.y
        drawLine(this.ctx, this.x, this.y, x2, y2, 5, 'rgb(255, 100, 100)', cam)
        drawName(this.ctx, this, cam)
    }

    bounceback(){
        //this.v = {x:-1*this.v.x,y:-1*this.v.y}
        this.x = this.x-3
        this.y = this.y-3

    }
}


class Player extends Character {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name) {
        super(ctx, x, y, r, col, v, bulletV, vVal, name)
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


class Bot extends Character {
    constructor(ctx, x, y, r, col, v, bulletV, vVal, name) {
        super(ctx, x, y, r, col, v, bulletV, vVal, name)
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
}


function botFactory(num, ctx) {
    const botLst = []
    for (let i = 0; i < num; i++) {
        botLst.push(
            new Bot(
                ctx,
                100+Math.random()*2000,
                100+Math.random()*1000,
                26,
                [255, 255, 255],
                {x: 0, y: 0},
                3,
                7,
                `Bot ${i}`,
            )
        )
    }
    return botLst
}


export class Game {
    constructor(ctx, canvas) {
        this.ctx = ctx
        this.canvas = canvas
        // Identification Aura of different teams
        this.wtTeamSupCol = [100, 100, 255]
        this.bkTeamSupCol = [255, 100, 100]
        // game elements
        this.map = new Map(ctx, 3000, 1500)
        this.player = new Player(ctx, 100, 100, 26, [0, 0, 0], {x: 2, y: 2}, 7, 7, 'Luke')
        this.camera = new Camera(ctx, canvas.width, canvas.height, this.player)
        this.bulletLst = []
        this.botLst = botFactory(10, ctx)
        this.wtTeam = []
        this.bkTeam = []
    }

    shootBullet(character, e) {
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
                    e.clientX,
                    e.clientY,
                    character.bulletV
                )
            )
        )
    }
}
