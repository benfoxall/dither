var canvas = document.createElement('canvas')
document.body.appendChild(canvas)

var w = canvas.width = window.innerWidth
var h = canvas.height = window.innerHeight

var ctx = canvas.getContext('2d')
ctx.fillRect(0,0,20,20)

function gradient(offset){
  var g = ctx.createLinearGradient(offset,0,w+offset,0)

  g.addColorStop(0,'#000')
  g.addColorStop(0.5,'#fff')
  g.addColorStop(1,'#000')

  return g
}

function render(t){
  requestAnimationFrame(render)

  t = Math.sin(t/600) * 1000

  var offset = ((t / 5000) % 1) * w

  ctx.fillStyle = gradient(offset)
  ctx.fillRect(offset,0,w,h)

  ctx.fillStyle = gradient(offset-w)
  ctx.fillRect(offset-w,0,w,h)

}

requestAnimationFrame(render)
