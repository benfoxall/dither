var canvas = document.createElement('canvas')
document.body.appendChild(canvas)

var w = canvas.width = 100
var h = canvas.height = 100

var ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

function size(){
  var scale = Math.max(window.innerWidth, window.innerHeight) / w

  canvas.style.height = (h * scale) + 'px'
  canvas.style.width = (w * scale) + 'px'
}
size()
window.addEventListener('resize', size)


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
  }
  function index(x,y) {
    return (x + (y * w)) * 4
  }

  function color(i) {

    if(colorCache[i]) return colorCache[i]

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







var px = 0.5, py = 0.5, requested

function requestRender(){
  if(!requested) {
    requestAnimationFrame(render)
    requested = true
  }
}

function handleMouse(e) {
  px = e.clientX / window.innerWidth
  py = e.clientY / window.innerHeight
  requestRender()
}

function handleTouch(e) {
  e.preventDefault()

  var t0 = e.touches[0]

  px = t0.clientX / window.innerWidth
  py = t0.clientY / window.innerHeight

  requestRender()
}

window.addEventListener('mousemove', handleMouse, {passive:false})
window.addEventListener('touchmove', handleTouch, {passive:false})
window.addEventListener('touchstart', handleTouch, {passive:false})


function render(t){

  requested = false

  var offset = px * w

  ctx.fillStyle = gradient(offset)
  ctx.fillRect(offset,0,w,h)

  ctx.fillStyle = gradient(offset-w)
  ctx.fillRect(offset-w,0,w,h)

  dither(Math.floor(py*20)+2)

}


requestRender()
