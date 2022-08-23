import { vectorHelper, mapToCamX, mapToCamY } from "./helpers.js"


export class Map {
    constructor (ctx, width, height) {
        this.ctx = ctx
        this.width = width
        this.height = height
    }

    detectOut(gameObj) {
        if (gameObj.x < 0) gameObj.x = 0
        if (gameObj.x > this.width) gameObj.x = this.width
        if (gameObj.y < 0) gameObj.y = 0
        if (gameObj.y > this.height) gameObj.y = this.height
    }

    draw(cam) {
        this.ctx.beginPath()
        this.ctx.lineWidth = "10"
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
        console.log(this.x + '|' + this.y)
        this.centerX = this.focus.x
        this.centerY = this.focus.y
    }
}


class Player {
    constructor(ctx, x, y, r, col, v, bulletV) {
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.col = col
        this.v = v
        this.bulletV = bulletV
        this.curX = 0
        this.curY = 0
        this.w = false
        this.s = false
        this.a = false
        this.d = false
    }

    draw(cam) {
        this.ctx.beginPath()
        this.ctx.arc(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.r+4, 0, Math.PI*2, false)
        this.ctx.fillStyle = 'rgb(200, 0, 0)'
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.arc(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.r, 0, Math.PI*2, false)
        this.ctx.fillStyle = this.col
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.moveTo(mapToCamX(this.x, cam),mapToCamY(this.y, cam))
        const tarCoor = vectorHelper(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.curX, this.curY, this.r)
        this.ctx.lineTo(mapToCamX(this.x, cam) + tarCoor.x, mapToCamY(this.y, cam) + tarCoor.y)
        this.ctx.lineWidth = 4
        this.ctx.strokeStyle = 'rgb(200, 0, 0)'
        this.ctx.stroke()
    }

    update(cam) {
        this.draw(cam)
        if (this.w) this.y -= this.v
        if (this.s) this.y += this.v
        if (this.a) this.x -= this.v
        if (this.d) this.x += this.v
    }
}


class Bullet {
    constructor(ctx, x, y, r, col, v) {
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.col = col
        this.v = v
    }

    draw(cam) {
        this.ctx.beginPath()
        this.ctx.arc(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.r, 0, Math.PI*2, false)
        this.ctx.fillStyle = this.col
        this.ctx.fill()
    }

    update(cam) {
        this.draw(cam)
        this.x += this.v.x
        this.y += this.v.y
    }
}


class Bot {
    constructor(ctx, x, y, r, col, v, bulletV) {
        this.ctx = ctx
        this.x = x
        this.y = y
        this.r = r
        this.col = col
        this.v = v
        this.bulletV = bulletV
        this.curX = 0
        this.curY = 0
        this.w = false
        this.s = false
        this.a = false
        this.d = false
    }

    draw(cam) {
        this.ctx.beginPath()
        this.ctx.arc(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.r+4, 0, Math.PI*2, false)
        this.ctx.fillStyle = 'rgb(200, 0, 0)'
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.arc(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.r, 0, Math.PI*2, false)
        this.ctx.fillStyle = this.col
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.moveTo(mapToCamX(this.x, cam),mapToCamY(this.y, cam))
        const tarCoor = vectorHelper(mapToCamX(this.x, cam), mapToCamY(this.y, cam), this.curX, this.curY, this.r)
        this.ctx.lineTo(mapToCamX(this.x, cam) + tarCoor.x, mapToCamY(this.y, cam) + tarCoor.y)
        this.ctx.lineWidth = 4
        this.ctx.strokeStyle = 'rgb(200, 0, 0)'
        this.ctx.stroke()
    }

    update(cam) {
        this.draw(cam)
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
                'rgb(255, 255, 255)',
                {x: 0, y: 0},
            )
        )
    }
    return botLst
}


export class Game {
    constructor(ctx, canvas) {
        this.ctx = ctx
        this.canvas = canvas
        this.map = new Map(ctx, 3000, 1500)
        this.player = new Player(ctx, 100, 100, 26, 'rgb(0, 0, 0)', 3, 7)
        this.camera = new Camera(ctx, canvas.width, canvas.height, this.player)
        this.bulletLst = []
        this.botLst = botFactory(10, ctx)
    }

    shootBullet(player, e) {
        this.bulletLst.push(
            new Bullet(
                this.ctx,
                player.x, 
                player.y, 
                8, 
                'rgb(0, 0, 0)', 
                vectorHelper(
                    mapToCamX(player.x, this.camera),
                    mapToCamY(player.y, this.camera),
                    e.clientX,
                    e.clientY,
                    player.bulletV
                )
            )
        )
    }
}
