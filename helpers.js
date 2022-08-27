export function vectorHelper(selfX, selfY, tarX, tarY, vectorVal) {
    // do math
    const xDist = tarX-selfX
    const yDist = tarY-selfY
    const dist = (((xDist)**2+(yDist)**2)**(1/2))
    const ratio = vectorVal / dist
    const xv = xDist * ratio
    const yv = yDist * ratio
    // break down vector along x and y axis
    const v = {
        x: xv,
        y: yv
    }
    return v
}

export function EuDistance(x1,y1,x2,y2){
    var a = x1-x2
    var b = y1 -y2 
    return Math.sqrt(a*a+b*b)
}

export function mapToCamX(mapX, cam) {
    return mapX - (cam.centerX-cam.width/2)
}

export function mapToCamY(mapY, cam) {
    return mapY - (cam.centerY-cam.height/2)
}

export function colArrToStr(colArr) {
    return `rgb(${colArr[0]}, ${colArr[1]}, ${colArr[2]})`
}

export function drawCircle(ctx, x, y, r, col, cam=null) {
    ctx.beginPath()
    if (cam == null) { // draw on camera
        ctx.arc(x, y, r, 0, Math.PI*2, false)
    } else { // draw on map
        ctx.arc(mapToCamX(x, cam), mapToCamY(y, cam), r, 0, Math.PI*2, false)
    }
    ctx.fillStyle = colArrToStr(col)
    ctx.fill()
}

export function drawProgress(ctx,mycanvas,percentage){
    var canvasX = 100;
    var canvasY = 100;
//进度条是100%，所以要把一圈360度分成100份
    var progress = Math.PI * percentage;
//指定初始加载步长
    var steps = 0.5;
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 20;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 90, 0, Math.PI * 2, false)
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    ctx.strokeStyle = "#11111F";
    ctx.lineWidth = 20;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasX,canvasY,90, -Math.PI/2, -Math.PI/2+progress*2,false);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

}
export function calculateCurscore(allist){
    var white = 0
    var black = 0
    for(let i in allist){
        if(allist[i].team.id == 0){
            white = white+allist[i].col[0]
        }
        else{
            black = black + (255-allist[i].col[0])
        }
    }

    console.log(black/(black+white))
    return black/(black+white)
}


export function drawGradientCircle(ctx, x, y, inR, ouR, inCol, ouCol, cam=null) {
    ctx.beginPath()
    let gd
    if (cam == null) { // draw on camera
        gd = ctx.createRadialGradient(x, y, inR, x, y, ouR)
    } else { // draw on map
        gd = ctx.createRadialGradient(
            mapToCamX(x, cam), 
            mapToCamY(y, cam), 
            inR, 
            mapToCamX(x, cam), 
            mapToCamY(y, cam), 
            ouR
        )
    }
    gd.addColorStop(0, colArrToStr(inCol))
    gd.addColorStop(1, colArrToStr(ouCol))
    if (cam == null) {
        ctx.arc(x, y, 80, 0, Math.PI*2, false);
    } else {
        ctx.arc(mapToCamX(x, cam), mapToCamY(y, cam), ouR, 0, Math.PI*2, false);
    }
    ctx.fillStyle = gd
    ctx.fill()
}

export function drawLine(ctx, x1, y1, x2, y2, width, col, cam=null) {
    ctx.beginPath()
    if (cam == null) { // draw on camera
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
    } else { // draw on map
        ctx.moveTo(mapToCamX(x1, cam), mapToCamY(y1, cam))
        ctx.lineTo(mapToCamX(x2, cam), mapToCamY(y2, cam))
    }
    ctx.lineWidth = width
    ctx.strokeStyle = colArrToStr(col)
    ctx.stroke()
}

export function drawName(ctx, char, cam, col) {
    ctx.font = "25px Comic Sans MS"
    ctx.fillStyle = colArrToStr(col)
    ctx.textAlign = "center"
    ctx.fillText(`${char.name} (${char.col[0]})`, mapToCamX(char.x, cam), mapToCamY(char.y, cam)-char.r*1.5)
}

export function drawRect(ctx, topLeftX, topLeftY, width, height, lineWidth, col, cam=null) {
    ctx.beginPath()
    ctx.lineWidth = lineWidth.toString()
    ctx.strokeStyle = colArrToStr(col)
    if (cam == null) { // draw on camera
        ctx.rect(
            topLeftX,
            topLeftY,
            width,
            height,
        )
    } else { // draw on map
        ctx.rect(
            mapToCamX(topLeftX, cam),
            mapToCamY(topLeftY, cam),
            width,
            height,
        )
    }
    ctx.stroke()
}
