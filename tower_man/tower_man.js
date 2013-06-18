window.addEventListener("load",function() {

var Q = window.Q = Quintus({ development: true })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
        .setup({ width: 640, height: 480 })
        .controls().touch()


Q.gravityY = 0;
Q.graviyX = 0;

Q.component("towerManControls", {
  defaults: { speed: 100 },

  added: function() {
    var p = this.entity.p;

    Q._defaults(p,this.defaults);

    this.entity.on("step",this,"step");
    p.direction = 'right';
  },

  step: function(dt) {
    var p = this.entity.p;

    if(p.vx > 0) {
      p.angle = 90;
    } else if(p.vx < 0) {
      p.angle = -90;
    } else if(p.vy > 0) {
      p.angle = 180;
    } else if(p.vy < 0) {
      p.angle = 0;
    }

    p.direction = Q.inputs['left']  ? 'left' :
                  Q.inputs['right'] ? 'right' :
                  Q.inputs['up']    ? 'up' :
                  Q.inputs['down']  ? 'down' : p.direction;

    switch(p.direction) {
      case "left": p.vx = -p.speed; break;
      case "right":p.vx = p.speed; break;
      case "up":   p.vy = -p.speed; break;
      case "down": p.vy = p.speed; break;
    }
  }
});


Q.Sprite.extend("Player", {
  init: function(p) {

    this._super(p,{
      sheet:"player"
    });

    this.add("2d,towerManControls");
  }
});


Q.Sprite.extend("Enemy", {
  init: function(p) {

    this._super(p,{
      sheet:"enemy"
    });
  }
});


Q.scene("level1",function(stage) {

  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level.json',
                             sheet:     'tiles' }));


  var player = stage.insert(new Q.Player({ x: 48, y: 48 }));


  stage.insert(new Q.Enemy({ x: 320 + 16, y: 48 }));
 // stage.insert(new Q.Enemy({ x: 800, y: 0 }));

 // stage.insert(new Q.Tower({ x: 180, y: 50 }));
});


Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
  Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

  Q.compileSheets("sprites.png","sprites.json");

  Q.stageScene("level1");
});


});
