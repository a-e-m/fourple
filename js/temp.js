function randint(start, end) {
	return Math.floor(Math.random() * (end - start + 1) + start);
}

function toHSL(color) {
	return d3.hsl(color[0], color[1] / 100, color[2] / 100);
}

function combineColors(colors) {
	if (colors.length === 0)
		return [0, 0, 0];
	var total = [0, 0, 0];
	for (var i = 0; color = colors[i]; ++i) {
		var hsl = toHSL(color);
		var lab = d3.lab(hsl);
		total[0] += lab.l;
		total[1] += lab.a;
		total[2] += lab.b;
	}
	for (var j = 0; j < total.length; ++j)
		total[j] /= colors.length;
	var result = d3.lab(total[0], total[1], total[2]);
	var hsl = d3.hsl(result);
	return [hsl.h, hsl.s * 100, hsl.l * 100];
	/*if (colors.length === 0)
		return [0, 0, 0];
	var color = [colors[0][0], colors[0][1], colors[0][2]];
	for (var i = 1; i < colors.length; ++i) {
		var newColor = [colors[i][0], colors[i][1], colors[i][2]];
		if ((Math.max(newColor[0], color[0]) - Math.min(newColor[0], color[0])) > 180)
			newColor[0] += 360;
		var lumin1 = color[1] / 100, lumin2 = newColor[1] / 100, total = lumin1 + lumin2;
		if (total == 0)
			total = 1;
		color[0] = (color[0] * (lumin1 / total) + newColor[0] * (lumin2 / total)) % 360;
		color[1] = (color[1] + newColor[1]) / 2;
		color[2] = (color[2] + newColor[2]) / 2;
	}
	return color;*/
	
	
}

function Rect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Rect.prototype.center = function(x, y) {
	var hw = this.w / 2;
	var hh = this.h / 2;
	this.x = (x - hw);
	this.y = (y - hh);
}

Rect.prototype.colliderect = function(r) {
	if (this.x > (r.x + r.w))
		return false;
	else if (r.x > (this.x + this.w))
		return false;
	else if (this.y > (r.y + r.h))
		return false;
	else if (r.y > (this.y + this.h))
		return false;
	return true;
}

Rect.prototype.contains = function(r) {
	return this.x < r.x && (this.x + this.w) > (r.x + r.w) && this.y < r.y && (this.y + this.h) > (r.y + r.h);
}

Rect.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
}

Rect.prototype.clamp = function(r) {
	if (this.x < r.x)
		this.x = r.x;
	else if ((this.x + this.w) > (r.x + r.w))
		this.x = r.x + r.w - this.w;
	else if (this.y < r.y)
		this.y = r.y;
	else if ((this.y + this.h) > (r.y + r.h))
		this.y = r.y + r.h - this.h;
}

function Sprite() {
}

Sprite.prototype.formatColor = function() {
	return 'hsl(' + this.color[0] + ',' + this.color[1] + '%,' + this.color[2] + '%)'; 
}

Sprite.prototype.draw = function() {
	var r = this.rect;
	main.rect(r.x, r.y, r.w, r.h, this.formatColor());
}

function Wall(x, y, w, h, color) {
	this.rect = new Rect(x, y, w, h);
	this.color = this.generateColor();
}
Wall.prototype = Object.create(Sprite.prototype);
Wall.prototype.constructor = Sprite;

Wall.prototype.generateColor = function() {
	var colors = [];
	var n = randint(2, 3);
	for (var i = 0; i < n; ++i) {
		var color = main.colors[randint(0, main.colors.length - 1)];
		colors.push(color);
	}
	return combineColors(colors);
}

Wall.prototype.colorClose = function(color) {
	var thisLab = toHSL(this.color);
	var otherLab = toHSL(this.color);
	var distance = Math.pow(thisLab.l - otherLab.l, 2) + Math.pow(thisLab.a - otherLab.a, 2) + Math.pow(thisLab.b - otherLab.b, 2);
	return distance < Math.pow(30, 2);
}

Wall.prototype.update = function(p) {
	if (p.rect.colliderect(this.rect)) {
		if (this.colorClose(p.color)) {
			return true;
		}
	}
	return false;
}
        
function Ball(move, color, x, y) {
	this.rect = new Rect(0, 0, 10, 10);
	this.rect.center(x, y);
	this.color = color;
	this.x = move[0];
	this.y = move[1]
	this.trapped = false
	this.angle = Math.atan2(this.y, this.x);
}
Ball.prototype = Object.create(Sprite.prototype);
Ball.prototype.constructor = Sprite;

Ball.prototype.reassign = function() {
    var b = [[255, 255, 0], [200, main.state.width - 30]];
    var r0 = Math.random();
    var r1 = Math.floor(Math.random() * main.state.width);
    if (r0 < 0.25)
        b = [[0, 255, 0], [30, r1]];
    else if (r0 < 0.5)
        b = [[0, 255, 255], [r1, 30]];
    else if (r0 < 0.75)
        b = [[255, 0, 0], [main.state.width - 30, r1]];
    else
		b = [[255, 255, 0], [r1, main.state.width - 30]];
	this.rect.center(b[1][0], b[1][1]);
    this.angle = Math.atan2(this.y, this.x);
}
        
Ball.prototype.update = function(paddle, walls) {
	var that = this;
	var screen = new Rect(0, 0, main.state.width, main.state.height);
	if (!screen.contains(this.rect))
		this.reassign();
	paddle.rects.forEach(function(r) {
		if (that.rect.colliderect(r[0]) && !paddle.down && !paddle.rect.contains(that.rect)) {
			if (r[1][0])
				that.x = r[1][0] * Math.abs(that.x);
			if (r[1][1])
				that.y = r[1][1] * Math.abs(that.y);
		}
	});

	if (paddle.rect.colliderect(this.rect)) {
		if (paddle.down) {
			if (!this.trapped) {
				++main.metrics.ballsCaught;
			}
			this.trapped = true;
		} else {
			this.trapped = false;
			this.x += main.mouse.relX / 5;
			this.y += main.mouse.relY / 5;
		}
	}
	
	if ((this.x > 5) || (this.x < -5))
		this.x -= Math.sign(this.x) * 3;
	if ((this.y > 5) || (this.y < -5))
		this.y -= Math.sign(this.y) * 3;
	this.rect.move(this.x, this.y);
	if (this.trapped)
		this.rect.center(main.mouse.x, main.mouse.y);
}

   
function Paddle() {
	this.rect = new Rect(0, 0, 40, 40);
	this.rect.center(200, 200);
	this.color = [0, 0, 0];
	this.down = false;
	this.screen = new Rect(0, 0, main.state.width, main.state.height);
}
Paddle.prototype = Object.create(Sprite.prototype);
Paddle.prototype.constructor = Sprite;
        
Paddle.prototype.update = function(balls) {
	if (this.down !== main.mouse.down) {
		console.log('Mouse is now ' + (main.mouse.down ? 'down': 'up'));
		if (main.mouse.down)
			++main.metrics.timesDown;
		else
			++main.metrics.timesUp;
	}
	this.down = main.mouse.down;
	main.mouse.x = Math.min(Math.max(main.mouse.x, this.rect.w / 2), main.state.width - this.rect.w / 2);
	main.mouse.y = Math.min(Math.max(main.mouse.y, this.rect.h / 2), main.state.height - this.rect.h / 2);
	this.rect.center(main.mouse.x, main.mouse.y); 
	//this.rect.clamp(screen);
	this.leftside = [new Rect(this.rect.x, this.rect.y + 5, 5, 30), [-1, 0]];
	this.rightside = [new Rect(this.rect.x + this.rect.w - 5, this.rect.y + 5, 5, 30), [1, 0]];
	this.topside = [new Rect(this.rect.x + 5, this.rect.y, 30, 5), [0, -1]];
	this.bottomside = [new Rect(this.rect.x + 5, this.rect.y + this.rect.h - 5, 30, 5), [0, 1]];
	this.rects = [this.leftside, this.rightside, this.topside, this.bottomside];
	
	var colors = [],  n = 0;
	for (var i = 0, b; b = balls[i]; ++i) {
		if (!b.trapped)
			continue;
		colors.push(b.color);
	}
	
	
	this.color = combineColors(colors);
}


function Game() {
	main.metrics.start = (new Date).getTime();
    var lw = new Wall(0, 0, 10, main.state.height);
    var tw = new Wall(0, 0, main.state.width, 10);
    var rw = new Wall(main.state.width - 10, 0, 10, main.state.height);
    var bw = new Wall(0, main.state.height - 10, main.state.width, 10);
    this.walls = [lw, tw, rw, bw];
    
    this.balls = [];
    this.p = new Paddle();
    
	var color = 0;
    for (var x = -1; x < 3; ++x) {
		for (var y = -1; y < 3; ++y) {
			var y2 = y;
            if (y2 === 0)
				y2 = randint(1, 5);
            var c = main.colors[color++];
			if (color >= main.colors.length)
				color = 0;
            var b = new Ball([randint(-3, 3), y2], c, 200, 200);
            this.balls.push(b);
		}
	}
}

Game.prototype.update = function() {
	// pos = list(pygame.mouse.get_pos())
	// pos[0] += joy_offset[0]
	// pos[1] += joy_offset[1]
	// pygame.mouse.set_pos(pos)
	
	main.mouse.x += main.state.joyX;
    main.mouse.y += main.state.joyY;

	main.clear();
	this.walls.forEach(function(w) {
		w.draw();
	});
		
	this.balls.forEach(function(b) {
		b.draw();
	});

	this.p.draw(this.b);
	this.p.update(this.balls);
	var that = this;
	
	this.walls.forEach(function(w) {
		var result = w.update(that.p);
		if (result) {
			that.walls = _.filter(that.walls, function(v){return v !== w;});
		}
	});
	
	if (this.walls.length === 0) {
		main.metrics.end = (new Date).getTime();
		main.recordMetrics();
		window.location.replace('win.html')
	}
	
	this.balls.forEach(function(b) {
		b.update(that.p, that.walls);
	});
	
	
}
        


