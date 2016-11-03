var canvas = document.createElement('canvas')
document.body.appendChild(canvas)

var w = canvas.width = 100
var h = canvas.height = 100

var ctx = canvas.getContext('2d')
ctx.fillRect(0,0,20,20)


canvas.style.height = (h * 5) + 'px'
canvas.style.width = (w * 5) + 'px'
ctx.imageSmoothingEnabled = false

function gradient(offset){
  var g = ctx.createLinearGradient(offset,0,w+offset,0)

  g.addColorStop(0,'#000')
  g.addColorStop(0.5,'#fff')
  g.addColorStop(1,'#000')

  return g
}

ctx.fillStyle = gradient(0)
ctx.fillRect(0,0,w,h)


function dither(){
  var image = ctx.getImageData(0,0,w,h)

  var oldpixel, newpixel, i, quant_error

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      i = (x + (y * w)) * 4

      oldpixel = image.data[i]

      // newpixel  := find_closest_palette_color(oldpixel)
      newpixel = closest(oldpixel)

      // pixel[x][y]  := newpixel
      image.data[i]   = newpixel
      image.data[i+1] = newpixel
      image.data[i+2] = newpixel

      // quant_error  := oldpixel - newpixel
      quant_error = oldpixel - newpixel

      // may introduce clamping

      // pixel[x + 1][y    ] := pixel[x + 1][y    ] + quant_error * 7 / 16
      image.data[index(x+1, y)] += quant_error * 7 / 16

      // pixel[x - 1][y + 1] := pixel[x - 1][y + 1] + quant_error * 3 / 16
      image.data[index(x-1, y+1)] += quant_error * 3 / 16

      // pixel[x    ][y + 1] := pixel[x    ][y + 1] + quant_error * 5 / 16
      image.data[index(x, y+1)] += quant_error * 5 / 16

      // pixel[x + 1][y + 1] := pixel[x + 1][y + 1] + quant_error * 1 / 16
      image.data[index(x+1, y+1)] += quant_error * 1 / 16

    }
  }

  ctx.putImageData(image,0,0)

  function closest(p) {
    return p > 127 ? 255 : 0
  }
  function index(x,y) {
    return (x + (y * w)) * 4
  }
}

dither()


function render(t){
  requestAnimationFrame(render)

  t = Math.sin(t/600) * 1000

  var offset = ((t / 5000) % 1) * w

  ctx.fillStyle = gradient(offset)
  ctx.fillRect(offset,0,w,h)

  ctx.fillStyle = gradient(offset-w)
  ctx.fillRect(offset-w,0,w,h)

  dither()

}

// requestAnimationFrame(render)
