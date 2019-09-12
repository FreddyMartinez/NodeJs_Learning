(function(){
    self.Board = function(width, height) {
        this.width = width;
        this.height =  height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    }

    self.Board.prototype = {
        get elements(){
            var elements = this.bars;
            elements[2] = this.ball;
            return elements;
        }
    }
})();

(function(){
    self.Bar = function(x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 5;
    }

    self.Bar.prototype = {
        down: function() {
            this.y += this.speed;
        },
        up: function() {
            this.y -= this.speed;
        },
        toString: function() {
            return "x: " + this.x + "y: " + this.y;
        }
    }
})();

(function() {
    self.Ball = function(x,y,radius,board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_x = 5;
        this.speed_y = 0;
        this.direction = 1;
        this.bounce_anglee = 0;
        this.max_bounce_angle = Math.PI/12;
        this.board = board;
        board.ball = this;
        this.kind = "circle";
    } 

    self.Ball.prototype = {
        move: function() {
            this.x += (this.speed_x * this.direction);
            this.y += this.speed_y;
        },
        collision: function(bar) {
            var relative_intersect_y = ( bar.y + bar.height/2) - this.y;
            var normalized_intersect_y = relative_intersect_y / (bar.height/2);

            this.bounce_anglee = normalized_intersect_y * this.max_bounce_angle;

            let sp = Math.sqrt( Math.pow(this.speed_x,2) + Math.pow(this.speed_y,2))
            this.speed_y = sp* -Math.sin(this.bounce_anglee);
            this.speed_x = sp* Math.cos(this.bounce_anglee);

            if(this.x > (this.board.width/2)) this.direction = -1;
            else this.direction = 1;
        }
    }
})();

(function(){
    self.BoardView =   function(canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        clean: function() {
            this.ctx.clearRect(0,0,board.width, board.height);
        },
        draw: function() {
            for (var i = this.board.elements.length -1; i>=0; i--) {
                var el = this.board.elements[i];

                draw(this.ctx, el);
            }
        },
        play: function() {
            if(board.playing){
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
            }
        },
        check_collisions: function() {
            for(var i= this.board.bars.length -1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if(hit(bar, this.board.ball)){
                    this.board.ball.collision(bar);
                }
            }
        }
    }

    function hit(a,b) {
        var hit = false;
        if(b.x + b.radius >= a.x && b.x < a.x + a.width) {
            if(b.y + b.radius >= a.y && b.y < a.y + a.height) {
                hit = true;
            }
        }
        if(b.x <= a.x && b.x + b.radius >= a.x + a.width) {
            if(b.y <= a.y && b.y + b.radius >= a.y + a.height) {
                hit = true;
            }
        }
        if(a.x <= b.x && a.x + a.width >= b.x + b.radius) {
            if(a.y <= b.y && a.y + a.height >= b.y + b.radius) {
                hit = true;
            }
        }
        return hit;
    }

    function draw(ctx, element) {
        switch(element.kind) {
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle": 
                ctx.beginPath();
                ctx.arc(element.x,element.y,element.radius,0,7);
                ctx.fill();
                ctx.closePath();
                break;
        }
    }
})();

var board = new Board(800,400);
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas, board);
var bar1 = new Bar(50,100,20,100, board);
var bar2 = new Bar(750,100,20,100, board);
var ball = new Ball(350,100,10,board);

window.requestAnimationFrame(controller);

function controller(){
    board_view.play();
    window.requestAnimationFrame(controller);
}

document.addEventListener("keydown", function(ev) {
    if(ev.keyCode == 38) {
        ev.preventDefault();
        bar1.up();
    } else if(ev.keyCode == 40) {
        ev.preventDefault();
        bar1.down();
    } else if(ev.keyCode == 87) {
        ev.preventDefault();
        bar2.up();
    } else if(ev.keyCode == 83) {
        ev.preventDefault();
        bar2.down();
    } else if(ev.keyCode == 32) {
        ev.preventDefault();
        board.playing = !board.playing;
    }
})