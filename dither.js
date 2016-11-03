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

// var quant = d3.scaleQuantize()
//   .domain([0, 255])
//   .range([1,2,3,5])
  // .ticks(10)

function dither(stops){
  var colorCache = {}

  var quant = d3.scaleQuantize()
    .domain([0, 255])
    .range(d3.range(0,255,255/(stops||2)))

  window.q = quant


  var image = ctx.getImageData(0,0,w,h)

  var oldpixel, newpixel, i, quant_error

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      i = index(x, y)

      oldpixel = image.data[i]

      // newpixel  := find_closest_palette_color(oldpixel)
      newpixel = closest(oldpixel)

      // pixel[x][y]  := newpixel
      var components = color(newpixel)
      image.data[i]   = components.r
      image.data[i+1] = components.g
      image.data[i+2] = components.b


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
    return quant(p)
    // return p < 50 ? 0 :
    //        p < 100 ? 60 :
    //        p < 150 ? 100 :
    //        p < 200 ? 160 :
    //        255
  }
  function index(x,y) {
    return (x + (y * w)) * 4
  }

  function color(i) {

    if(colorCache[i]) return colorCache[i]

    // console.log("mis", i/255, d3.interpolateViridis(i/255))


    var c = d3.interpolateViridis(i/255)
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c)

    return colorCache[i] = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }


    // var c = d3.interpolateCool(i/255)
    // var result = /^rgb\((\d+), (\d+), (\d+)\)$/i.exec(c)
    //
    // return colorCache[i] = {
    //     r: parseInt(result[1], 16),
    //     g: parseInt(result[2], 16),
    //     b: parseInt(result[3], 16)
    // }

  }
}

dither(10)


function render(time){
  requestAnimationFrame(render)

  t = Math.sin(time/600) * 1000

  var offset = ((t / 5000) % 1) * w

  ctx.fillStyle = gradient(offset)
  ctx.fillRect(offset,0,w,h)

  ctx.fillStyle = gradient(offset-w)
  ctx.fillRect(offset-w,0,w,h)

  var p = (time/600) % 20

  dither(Math.ceil(p) + 1)

}

requestAnimationFrame(render)
