
    // 1. Wait for the onload even
    window.addEventListener("load",function() {

      // Set up a basic Quintus object
      // with the necessary modules and controls
      var Q = window.Q = Quintus({ development: true })
              .include("Sprites, Scenes, Input, 2D")
              .setup({ width: 640, height: 480 })
              .controls(true)

      // Add in the default keyboard controls
      // along with joypad controls for touch
      Q.input.keyboardControls();
      Q.input.joypadControls();

      Q.gravityX = 0;
      Q.gravityY = 0;

      var SPRITE_PLAYER = 1;
      var SPRITE_TILES = 2;
      var SPRITE_ENEMY = 4;
      var SPRITE_DOT = 8;

      Q.component("towerManControls", {
        // default properties to add onto our entity
        defaults: { speed: 100, direction: 'up' },

        // called when the component is added to
        // an entity
        added: function() {
          var p = this.entity.p;

          // add in our default properties
          Q._defaults(p,this.defaults);

          // every time our entity steps
          // call our step method
          this.entity.on("step",this,"step");
        },

        step: function(dt) {
          // grab the entity's properties
          // for easy reference
          var p = this.entity.p;

          // rotate the player
          // based on our velocity
          if(p.vx > 0) {
            p.angle = 90;
          } else if(p.vx < 0) {
            p.angle = -90;
          } else if(p.vy > 0) {
            p.angle = 180;
          } else if(p.vy < 0) {
            p.angle = 0;
          }

          // grab a direction from the input
          p.direction = Q.inputs['left']  ? 'left' :
                        Q.inputs['right'] ? 'right' :
                        Q.inputs['up']    ? 'up' :
                        Q.inputs['down']  ? 'down' : p.direction;

          // based on our direction, try to add velocity
          // in that direction
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
            collisionMask: SPRITE_TILES | SPRITE_ENEMY | SPRITE_DOT
          });

          this.add("2d, towerManControls");
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
        init: function(p) {
          p = p || {};
          this._super(Q._defaults(p,{
            type: SPRITE_TILES,
            dataAsset: 'level.json',
            sheet:     'tiles',
          }));

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
