

var cell_navbar = document.getElementById("cell-navbar")
var navbar      = document.getElementById("navbar")
var eventSource = makeObservable({})
var env_canvas = document.getElementById("environment-canvas")
var hidden_canvas = window.document.createElement("canvas");
var env_ctx = env_canvas.getContext('2d')
var hidden_ctx = hidden_canvas.getContext('2d');
var w = hidden_canvas.width  = env_canvas.width;
var h = hidden_canvas.height = env_canvas.height;


var zeros = function (dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
};


var t=0;
var grid_cells = []

var d = 1000000
var [X,V] = random_torus_walk(d, w, h, 2.0)
var heatmap = zeros([h,w])
var speed = 1
var gc_id = 0
var mx = X[t][0];
var my = X[t][1];

// 
// colors for... [[ background, agent, big circle, small circle ]]
// 
var colors = [
  ["rgba(0, 0, 0, 1.0)", "rgba(255, 255, 255, 1.0)", "rgba(255,   0,   0, 0.01)", "rgba(255, 0, 0, 1.0)" ],
  ["rgba(0, 0, 0, 1.0)", "rgba(255, 255, 255, 1.0)", "rgba(255, 255, 255, 0.01)", "rgba(255, 255, 255, 1.0)" ],
  ["rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 1.0)", "rgba(255, 0, 0, 0.01)", "rgba(255, 0, 0, 1.0)" ],
  ["rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 1.0)", "rgba(255, 0, 0, 0.01)", "rgba(255, 0, 0, 1.0)" ]
]


var theta = 1.43
var c = 110
grid_cells.push(create_firing_field(
  [
    [c*Math.cos(theta), c*Math.cos(theta + Math.PI/3.0)],
    [c*Math.sin(theta), c*Math.sin(theta + Math.PI/3.0)]
  ],
  [0, 0],
  [20, 20],
  60
))

theta = 0.43
c = 115
grid_cells.push(create_firing_field(
  [
    [c*Math.cos(theta), c*Math.cos(theta + Math.PI/3.0)],
    [c*Math.sin(theta), c*Math.sin(theta + Math.PI/3.0)]
  ],
  [10, 0],
  [20, 20],
  70
))


grid_cells.push(create_firing_field(
  [
    [100,   0],
    [  0, 100]
  ],
  [150, 150],
  [20, 20],
  100
))







cell_navbar.addEventListener("click", function (e) {
  if(e.target.className.indexOf("btn") > -1) eventSource.fire(e.target.getAttribute("event"), { value: e.target.getAttribute("value")});
})

navbar.addEventListener("click", function (e) {
  if(e.target.className.indexOf("btn") > -1) eventSource.fire(e.target.getAttribute("event"), { value: e.target.getAttribute("value")});
})

eventSource.on("switchcell", function(e) {
  gc_id = e.value  
  hidden_ctx.fillStyle =colors[gc_id][0];
  hidden_ctx.fillRect(0,0,w,h);
});

eventSource.on("speedup", function(e) {
  speed += 1
  console.log(speed)
});

eventSource.on("speeddown", function(e) {
  speed -= 1
  speed = Math.max(speed, 1)
  console.log(speed)
});

eventSource.on("speedreset", function(e) {
  speed = 1
  console.log(speed)
});




hidden_ctx.fillStyle =colors[gc_id][0];
hidden_ctx.fillRect(0,0,w,h);

env_ctx.imageSmoothingEnabled= false
hidden_ctx.imageSmoothingEnabled= false

var infinity = new AnimationFrameLoop(function () {
	env_ctx.clearRect(0, 0, w, h);
  


  mx = X[t%d][0];
  my = X[t%d][1];


  for (var i=0; i<speed; i++) {   
      for (var f of grid_cells[gc_id]) {
          if(f.spike([mx,my])) {
              beep()
              heatmap[parseInt(mx)][parseInt(my)] += 1

              hidden_ctx.fillStyle = colors[gc_id][2];
              r = 16
              hidden_ctx.beginPath();
              hidden_ctx.arc(mx,my,r,0,2*Math.PI);
              hidden_ctx.fill();

              hidden_ctx.fillStyle = colors[gc_id][3]
              // hidden_ctx.fillRect(mx, my, 1, 1); 
              hidden_ctx.beginPath();
              hidden_ctx.arc(mx,my,1,0,2*Math.PI);
              hidden_ctx.fill();
          }
      }
      t+= 1
  }
  var image_data = hidden_ctx.getImageData(0, 0, w, h);
  env_ctx.putImageData(image_data, 0, 0);
  env_ctx.fillStyle = colors[gc_id][1];
  env_ctx.fillRect(mx - 5,my - 5,10,10);

});



