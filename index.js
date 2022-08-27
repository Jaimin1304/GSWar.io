import { calculateCurscore } from "./helpers.js"
import { Game, Bot } from "./models.js"

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const g = new Game(ctx, canvas, 3500, 2000)

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    g.camera.update(g.camera)
    var percentage = calculateCurscore(g.cLst)
    g.map.draw(g.camera,canvas,percentage)
    // bullets' logic per frame
    g.bulletLst.forEach(e => {
        e.update(g.camera)
        if (g.map.detectOut(e)) {
            let idx = g.bulletLst.indexOf(e)
            g.bulletLst.splice(idx, 1)
        }
        // detect bullet-tower collision
        g.towerlst.forEach(t => {
            if (e.shoot(t)) {
                let idx = g.bulletLst.indexOf(e)
                g.bulletLst.splice(idx, 1)
            }
        })
    })
    // characters' logic per frame
    for (let i = 0; i < g.cLst.length; i++) {
        g.cLst[i].update(g.camera)
        g.map.mapRestrict(g.cLst[i])
        // if character is at its team base, its own color will be purified
        g.cLst[i].recover()
        // detect character-character collision
        for (let j = 0; j < g.cLst.length; j++) {
            if (i != j && g.cLst[i].detectEntity(g.cLst[j])) {
                g.cLst[i].bounceback(g.cLst[j])
            }
        }
        // detect bullet-character collision
        g.bulletLst.forEach(e => {
            if (e.shoot(g.cLst[i])) {
                let idx = g.bulletLst.indexOf(e)
                g.bulletLst.splice(idx, 1)
            }
        })
        if (g.cLst[i] instanceof Bot) g.cLst[i].behave(g)
    }
    // towers' logic per frame
    g.towerlst.forEach(e => {
        console.log(e.x + e.y)
        e.update(g.camera)
        // detect tower-character collision
        g.cLst.forEach(c => {
            if (e.detectEntity(c)) {
                e.bounceback(c, true)
            }
        })
    })
}

addEventListener('mousemove', (e) => {
    g.player.curX = e.clientX
    g.player.curY = e.clientY
})

addEventListener('click', (e) => {
    g.shootBullet(g.player, e.clientX, e.clientY)
})

addEventListener('keydown', (e) => {
    if (e.key == 'w') g.player.w = true
    if (e.key == 's') g.player.s = true
    if (e.key == 'a') g.player.a = true
    if (e.key == 'd') g.player.d = true
})

addEventListener('keyup', (e) => {
    if (e.key == 'w') g.player.w = false
    if (e.key == 's') g.player.s = false
    if (e.key == 'a') g.player.a = false
    if (e.key == 'd') g.player.d = false
})

animate()
