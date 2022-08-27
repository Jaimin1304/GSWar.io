import { Game } from "./models.js"

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const game = new Game(ctx, canvas)

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.camera.update(game.camera)

    game.map.draw(game.camera)
    game.bulletLst.forEach(element => {
        element.update(game.camera)
        
    });
    game.botLst.forEach(element => {
        element.update(game.camera)
        game.map.detectOut(element)
        let result = game.player.detectEntity(element)
        console.log(result)
        if(game.player.detectEntity(element)){
            game.player.bounceback()
            
        }
        game.bulletLst.forEach(bull =>{
            result = bull.shoot(element)
            if(result){
                var i = game.bulletLst.indexOf(bull)
                game.bulletLst.splice(i,1)
            }

        }
        )
    });
    game.player.update(game.camera)
    game.map.detectOut(game.player)
    
}

addEventListener('mousemove', (e) => {
    game.player.curX = e.clientX
    game.player.curY = e.clientY
})

addEventListener('click', (e) => {
    game.shootBullet(game.player, e)
})

addEventListener('keydown', (e) => {
    if (e.key == 'w') game.player.w = true
    if (e.key == 's') game.player.s = true
    if (e.key == 'a') game.player.a = true
    if (e.key == 'd') game.player.d = true
})

addEventListener('keyup', (e) => {
    if (e.key == 'w') game.player.w = false
    if (e.key == 's') game.player.s = false
    if (e.key == 'a') game.player.a = false
    if (e.key == 'd') game.player.d = false
})

animate()
