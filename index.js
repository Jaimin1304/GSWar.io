import { Game } from "./models.js"

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const g = new Game(ctx, canvas, 3520, 1980)

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    g.camera.update(g.camera)

    g.map.draw(g.camera)
    // bullet's logic per frame
    g.bulletLst.forEach(e => {
        e.update(g.camera)
        if (g.map.detectOut(e)) {
            let idx = g.bulletLst.indexOf(e)
            g.bulletLst.splice(idx, 1)
        }
    });
    // character's logic per frame
    for (let i = 0; i < g.cLst.length; i++) {
        g.cLst[i].update(g.camera)
        g.map.mapRestrict(g.cLst[i])
        // if character is at its team base, its own color will be purified
        g.cLst[i].recover()
        // detect character-character collision
        for (let j = 0; j < g.cLst.length; j++) {
            if (i != j && g.cLst[i].detectEntity(g.cLst[j])) {
                g.cLst[i].bounceback()
            }
        }
        // detect bullet-character collision
        g.bulletLst.forEach(e => {
            if (e.shoot(g.cLst[i])) {
                let idx = g.bulletLst.indexOf(e)
                g.bulletLst.splice(idx, 1)
            }
        })
        g.cLst[i].behave(g)
    }
    // g.cLst.forEach(element => {
    //     element.update(g.camera)
    //     g.map.mapRestrict(element)
    //     // detect character-character collision
    //     if (g.player.detectEntity(element)) {
    //         g.player.bounceback()
    //     }
    //     // detect bullet-character collision
    //     g.bulletLst.forEach(e => {
    //         if (e.shoot(element)) {
    //             let i = g.bulletLst.indexOf(e)
    //             g.bulletLst.splice(i,1)
    //         }
    //     })
    // })
    // // player's logic per frame
    // g.player.update(g.camera)
    // g.map.mapRestrict(g.player)
}

addEventListener('mousemove', (e) => {
    g.player.curX = e.clientX
    g.player.curY = e.clientY
})

addEventListener('click', (e) => {
    g.shootBullet(g.player, e)
    console.log(g.bulletLst)
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
