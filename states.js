import { EuDistance, areaHasElement, areaNearestObj } from "./helpers.js"


class State {
    constructor(name='state') {
        this.name = name
    }
}


export class AtkEnemyState extends State {
    behave(bot, game) {
        console.log('--- atkEnemyState ---')
        // identify team
        let botTeam = []
        let enemyTeam = []
        if (bot.team.id == 0) {
            botTeam = game.wtTeam
            enemyTeam = game.bkTeam
        }
        if (bot.team.id == 1) {
            botTeam = game.bkTeam
            enemyTeam = game.wtTeam
        }
        // set destination
        // set target
        let dest = areaNearestObj(enemyTeam, bot.visionR, bot.x, bot.y)
        if (dest != null) {
            bot.curX = dest.x + bot.randomWeight
            bot.curY = dest.y + bot.randomWeight
            bot.tarX = dest.x
            bot.tarY = dest.y
        } else {
            bot.state = new AtkTowerState() // change state
        }
        // change state
        if ((bot.col[0]-bot.team.teamCol[0])**2 > (127-bot.team.teamCol[0])**2) {
            bot.state = new RetreatState() // retreat
        }
    }
}


export class AtkTowerState extends State {
    behave(bot, game) {
        console.log('--- atkTowerState ---')
        // identify team
        let botTeam = []
        let enemyTeam = []
        if (bot.team.id == 0) {
            botTeam = game.wtTeam
            enemyTeam = game.bkTeam
        }
        if (bot.team.id == 1) {
            botTeam = game.bkTeam
            enemyTeam = game.wtTeam
        }
        // set destination
        // set target
        let dist = 99999
        game.towerLst.forEach(e => {
            if (
                (bot.col[0]-bot.team.teamCol[0])**2 < 
                (e.col[0]-bot.team.teamCol[0])**2 &&
                EuDistance(bot.x, bot.y, e.x, e.y) < dist
            ) {
                dist = EuDistance(bot.x, bot.y, e.x, e.y)
                bot.curX = e.x + bot.randomWeight
                bot.curY = e.y + bot.randomWeight
                bot.tarX = e.x
                bot.tarY = e.y
            }
        })
        // change state
        if ((bot.col[0]-bot.team.teamCol[0])**2 > (127-bot.team.teamCol[0])**2) {
            bot.state = new RetreatState() // retreat
        }
        let enemy = areaNearestObj(enemyTeam, bot.visionR, bot.x, bot.y)
        if (enemy != null && Math.random() > 0.7) {
            bot.state = new AtkEnemyState() // attack enemy
        }
    }
}


export class RetreatState extends State {
    behave(bot, game) {
        console.log('--- retreatState ---')
        // identify team
        let botTeam = []
        let enemyTeam = []
        if (bot.team.id == 0) {
            botTeam = game.wtTeam
            enemyTeam = game.bkTeam
        }
        if (bot.team.id == 1) {
            botTeam = game.bkTeam
            enemyTeam = game.wtTeam
        }
        // set destination
        bot.curX = bot.team.base.x + bot.randomWeight
        bot.curY = bot.team.base.y + bot.randomWeight
        // set target
        botTeam.forEach(e => {
            if (
                e != bot && 
                EuDistance(bot.x, bot.y, e.x, e.y) < bot.visionR && 
                (bot.team.teamCol[0] - bot.col[0])**2 < 
                (bot.team.teamCol[0] - e.col[0])**2
            ) {
                bot.tarX = e.x
                bot.tarY = e.y
            }
        })
        enemyTeam.forEach(e => {
            if (
                EuDistance(bot.x, bot.y, e.x, e.y) < bot.visionR && 
                (e.team.teamCol[0] - bot.col[0])**2 >
                (e.team.teamCol[0] - e.col[0])**2
            ) {
                bot.tarX = e.x
                bot.tarY = e.y
            }
        })
        // change state
        if (bot.col[0] == bot.team.teamCol[0]) {
            console.log('back to war')
            if (areaHasElement(enemyTeam, bot.visionR, bot.x, bot.y)) {
                bot.state = new AtkEnemyState()
            } else {
                bot.state = new AtkTowerState()
            }
        }
    }
}
