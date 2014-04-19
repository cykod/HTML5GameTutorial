window.addEventListener("load",function() {
  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D")
          .setup({ width: 640, height: 480 })

  Q.input.keyboardControls();
  Q.input.joypadControls();

  Q.gravityX = 0;
  Q.gravityY = 0;

  var SPRITE_PLAYER = 1;
  var SPRITE_TILES = 2;
  var SPRITE_ENEMY = 4;
  var SPRITE_OBJECT = 8;

  Q.Sprite.extend("Player", {
    init: function(p) {

      this._super(p,{
        sheet:"player",
        type: SPRITE_PLAYER,
        collisionMask: SPRITE_TILES | SPRITE_ENEMY
      });

      this.add("2d, topdownControls");
    }
  });

  Q.tilePos = function(col,row) {
    return { x: col*32 + 16, y: row*32 + 16 };
  }


  Q.TileLayer.extend("HackMap",{
    init: function() {
      this._super({
        type: SPRITE_TILES,
        dataAsset: 'countryside.tmx',
        sheet:     'tiles',
      });
    },

    collidableTile: function(tileNum) {
      return tileNum == 1 || tileNum == 4;
    }
  });


  Q.Sprite.extend("Enemy", {
    init: function(p) {

      this._super(p,{
        sheet:"enemy",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_PLAYER | SPRITE_TILES
      });

      this.add("2d");
    }
  });

  Q.scene("countryside",function(stage) {
    var map = stage.collisionLayer(new Q.HackMap());

    stage.insert(new Q.Player(Q.tilePos(1,1)));

    stage.insert(new Q.Enemy(Q.tilePos(10,4)));
    stage.insert(new Q.Enemy(Q.tilePos(16,10)));
    stage.insert(new Q.Enemy(Q.tilePos(5,10)));
  });

  Q.load("sprites.png, sprites.json, countryside.tmx, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 });

    Q.compileSheets("sprites.png","sprites.json");

    Q.stageScene("countryside");
  });

});
