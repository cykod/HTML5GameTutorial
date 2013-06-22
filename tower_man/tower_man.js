window.addEventListener("load",function() {

  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D")
          .setup({ width: 640, height: 480 })
          .controls()


  Q.gravityY = 0;
  Q.gravityX = 0;

  var SPRITE_PLAYER = 1;
  var SPRITE_TILES = 2;
  var SPRITE_ENEMY = 4;
  var SPRITE_DOT = 8;

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
        sheet:"player",
        type: SPRITE_PLAYER,
        collisionMask: SPRITE_DOT | SPRITE_ENEMY | SPRITE_TILES
      });

      this.add("2d,towerManControls");
    }

  });


  Q.component("enemyControls", {
    defaults: { speed: 100 },

    added: function() {
      var p = this.entity.p;

      Q._defaults(p,this.defaults);

      this.entity.on("step",this,"step");
      p.direction = 'left';
      this.entity.on('hit',this,"changeDirection");
    },

    step: function(dt) {
      var p = this.entity.p;

      if(Math.random() < 0.02) {
        this.tryDirection();
      }

      switch(p.direction) {
        case "left": p.vx = -p.speed; break;
        case "right":p.vx = p.speed; break;
        case "up":   p.vy = -p.speed; break;
        case "down": p.vy = p.speed; break;
      }
    },

    tryDirection: function() {
      var p = this.entity.p; 
      var from = p.direction;
      if(p.vy != 0 && p.vx == 0) {
        p.direction = Math.random() < 0.5 ? 'left' : 'right';
      } else if(p.vx != 0 && p.vy == 0) {
        p.direction = Math.random() < 0.5 ? 'up' : 'down';
      }
    },

    changeDirection: function(collision) {
      var p = this.entity.p;
      if(p.vx == 0 && p.vy == 0) {
        if(collision.normalY) {
          p.direction = Math.random() < 0.5 ? 'left' : 'right';
        } else if(collision.normalX) {
          p.direction = Math.random() < 0.5 ? 'up' : 'down';
        }
        p.tried = false;
      }
    }
  });


  Q.Sprite.extend("Enemy", {
    init: function(p) {

      this._super(p,{
        sheet:"enemy",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_PLAYER | SPRITE_TILES
      });

      this.add("2d,enemyControls");
      this.on("hit.sprite",this,"hit");
    },

    hit: function(col) {

      if(col.obj.isA("Player")) {
        Q.stageScene("level1");
      }
    }
  });


<<<<<<< HEAD
  Q.scene("level1",function(stage) {

    stage.collisionLayer(new Q.TileLayer({
                               dataAsset: 'level.json',
                               sheet:     'tiles' }));

        
=======
Q.Sprite.extend("Dot", {
  init: function(p) {
    this._super(p,{
      sheet: 'dot',
      type: SPRITE_DOT,
      sensor: true
    });

    this.on("sensor");
    this.on("inserted");
  },

  sensor: function() {
    this.destroy();
    this.stage.dotCount--;
    if(this.stage.dotCount == 0) {
      Q.stageScene("level1");
    }
  },

  inserted: function() {
    this.stage.dotCount = this.stage.dotCount || 0
    this.stage.dotCount++;
  }
});


Q.Dot.extend("Tower", {
  init: function(p) {
    this._super(Q._defaults(p,{
      sheet: 'tower'
    }));
  }
});

Q.tilePos = function(x,y) {
  return { x: x*32 + 16, y: y*32 + 16 };
}

Q.TileLayer.extend("TowerManMap",{
  init: function() {
    this._super({
      type: SPRITE_TILES,
      dataAsset: 'level.json',
      sheet:     'tiles',
    });

  },
  
  setup: function() {
    var tiles = this.p.tiles = this.p.tiles.concat();
    var size = 32;
    for(var y=0;y<tiles.length;y++) {
      var row = tiles[y] = tiles[y].concat();
      for(var x =0;x<row.length;x++) {
        var tile = row[x];

        if(tile == 0 || tile == 2) {
          var className = tile == 0 ? 'Dot' : 'Tower'
          this.stage.insert(new Q[className](Q.tilePos(x,y)));
          row[x] = 0;
        }
      }
    }
  }

});


Q.scene("level1",function(stage) {

  var map = stage.collisionLayer(new Q.TowerManMap());
  map.setup();

  stage.insert(new Q.Player(Q.tilePos(10,7)));

  stage.insert(new Q.Enemy(Q.tilePos(10,4)));
  stage.insert(new Q.Enemy(Q.tilePos(15,10)));
  stage.insert(new Q.Enemy(Q.tilePos(5,10)));

  });


  Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

    Q.compileSheets("sprites.png","sprites.json");

    Q.stageScene("level1");
  });


});
