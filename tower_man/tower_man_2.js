
    // Wait for the onload even
    window.addEventListener("load",function() {

      // Set up a basic Quintus object
      // with the necessary modules and controls
      var Q = window.Q = Quintus({ development: true })
              .include("Sprites, Scenes, Input, 2D")
              .setup({ width: 640, height: 480 })
              .controls(true)

      Q.gravityX = 0;
      Q.gravityY = 0;

      // Add in the default keyboard controls
      // along with joypad controls for touch
      Q.input.keyboardControls();
      Q.input.joypadControls();

      var SPRITE_PLAYER = 1;
      var SPRITE_TILES = 2;
      var SPRITE_ENEMY = 4;
      var SPRITE_DOT = 8;

      // Add in a basic sprite to get started
      Q.Sprite.extend("Player", {
        init: function(p) {

          this._super(p,{
            sheet:"player"
          });

          this.add("2d");
        }
      });


      // Create the Dot sprite
      Q.Sprite.extend("Dot", {
        init: function(p) {
          this._super(p,{
            sheet: 'dot',
            type: SPRITE_DOT,
            // Set sensor to true so that it gets notified when it's
            // hit, but doesn't trigger collisions itself that cause
            // the player to stop or change direction
            sensor: true
          });

          this.on("sensor");
          this.on("inserted");
        },

        // When a dot is hit..
        sensor: function() {
          // Destroy it and keep track of how many dots are left
          this.destroy();
          this.stage.dotCount--;
          // If there are no more dots left, just restart the game
          if(this.stage.dotCount == 0) {
            Q.stageScene("level1");
          }
        },

        // When a dot is inserted, use it's parent (the stage)
        // to keep track of the total number of dots on the stage
        inserted: function() {
          this.stage.dotCount = this.stage.dotCount || 0
          this.stage.dotCount++;
        }
      });


      // Tower is just a dot with a different sheet - use the same
      // sensor and counting functionality
      Q.Dot.extend("Tower", {
        init: function(p) {
          this._super(Q._defaults(p,{
            sheet: 'tower'
          }));
        }
      });

      // Return a x and y location from a row and column
      // in our tile map
      Q.tilePos = function(col,row) {
        return { x: col*32 + 16, y: row*32 + 16 };
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
          // Clone the top level arriw
          var tiles = this.p.tiles = this.p.tiles.concat();
          var size = this.p.tileW;
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

        var player = stage.insert(new Q.Player(Q.tilePos(10,7)));
      });

      Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
        Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 });

        Q.compileSheets("sprites.png","sprites.json");

        Q.stageScene("level1");
      });

    });
