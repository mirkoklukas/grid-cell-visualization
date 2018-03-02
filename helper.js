
var mod = function (a, b) {
    return ((a % b) + b) % b;
};

if(!Number.prototype.mod) { 
    Number.prototype.mod = function (b) {
        return ((this % b) + b) % b;
	};
}

var bind = function(that, f) {
  return function() {
    return f.apply(that, arguments);
  }
};

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

var extractMousePosition = function(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	return [posx, posy];
}

var Stage = function (canvasElement) {
	var canvas = canvasElement;
	var ctx = canvas.getContext('2d');

	this.size = function() {
		return [canvas.width, canvas.height]
	}

    this.pixel = function(position, color) {
	    ctx.fillStyle = color;
	    ctx.fillRect(position[0], position[1], 2, 2);
	};
	
	this.rect = function(position, size, color) {
	    ctx.fillStyle = color;
	    ctx.fillRect(position[0], position[1], size[0], size[1]);
	};

	this.circle = function(position, radius, color) {
	    ctx.fillStyle = color;
	    hidden_ctx.beginPath();
      	hidden_ctx.arc(position[0],position[1],radius,0,2*Math.PI);
      	hidden_ctx.fill();
	};

	this.clear = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

	this.imshow= function(imagedata) {
		ctx.putImageData(imageata, 0, 0)
	}
};

var makeObservable = function (obj) {
	var callbacks =  {};

	obj.on =  function (type, f) {
		(callbacks[type] = callbacks[type] || []).push(f);
		return obj;
	};

	obj.fire = function (type, data) {
		var args = [].slice.call(arguments, 1);
		(callbacks[type] || []).map(function (f) {
			f.apply(obj, args || null);
		});
		
		(callbacks["any"] || []).map(function (f) {
			f.apply(obj, [type].concat(args) );
		});
		return obj;
	};

	obj.fireMany = function (events) {
		var that = this;
		events.map(function (args) {
			that.fire.apply(that, args);
		});
	};
	
	obj.onAny = function (f) {
		(callbacks["any"] = callbacks["any"] || []).push(f);
		return obj;
	};

	return obj;
}


var AnimationFrameLoop = function (update) {
	var requestAnimationFrame = window.requestAnimationFrame || 
								window.mozRequestAnimationFrame ||
                              	window.webkitRequestAnimationFrame || 
                              	window.msRequestAnimationFrame;


	requestAnimationFrame(function tick() {
		update();
		requestAnimationFrame(tick);
	});
};





var beep = (function () { 
	var context = new AudioContext()
	var o = new OscillatorNode(context)
	var g = context.createGain()
	o.connect(g)
	g.connect(context.destination)
	o.connect(g)
	g.connect(context.destination)
	o.start(0)
	g.gain.linearRampToValueAtTime(0, context.currentTime)

	return function () {
		g.gain.linearRampToValueAtTime(1, context.currentTime);
		g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.04);
		g.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);}
})()

var dist = function(a, b) {
	return  Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)
}

var FiringPatch = function(params) {
	this.id     = params["id"];
	this.center = params["center"];
	this.radius = params["radius"];
	if ("prob" in params) this.prob = params["prob"];

};

FiringPatch.prototype.prob = function(p) {
	var c = this.center;
	var r = this.radius;
	var d = dist(p, c);

	if (d < r) return Math.exp(- (d^2)/10.);
	else return 0;
}

FiringPatch.prototype.spike = function (p) {
	return Math.random() < this.prob(p);
};


var create_firing_field = function(B, v, num_fields, r) {
  var [w,h] = num_fields
  var firing_field = []

  w = parseInt(w/2)
  h = parseInt(h/2)
  for (var x=-w; x<w; x++) {
    for (var y=-h; y<h; y++) {
      cx = x*B[0][0] + y*B[0][1] + v[0]
      cy = x*B[1][0] + y*B[1][1] + v[1]
      patch = new FiringPatch({
                    "id"    : [ x, y],
                    "center": [cx,cy],
                    "radius": r})
      firing_field.push(patch)
    }
  }
  return firing_field
};


// Standard Normal variate using Box-Muller transform.
var randn_bm = function() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

var random_torus_walk = function(d, w, h, speed) {
	var X = []
	var V = []

	var x = [0.5*w, 0.5*h]

	X.push(x.slice())
	var v = [0.0,0.0] 
	var theta = 0.0

	for (var t=0; t<d; t++) {
		theta += randn_bm()/4
		v[0] = speed*Math.cos(theta)
		v[1] = speed*Math.sin(theta)
		x[0] += v[0]
		x[1] += v[1]
		x[0] = mod(x[0],w)
		x[1] = mod(x[1],h)
		X.push(x.slice())
		V.push(v.slice())
	}


	return [X,V]
}



