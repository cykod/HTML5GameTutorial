
    // 1. Wait for the onload even
    window.addEventListener("load",function() {

      // 2. Set up a basic Quintus object
      //    with the necessary modules and controls
      var Q = window.Q = Quintus({ development: true })
              .include("Sprites, Scenes, Input, 2D")
              .setup({ width: 640, height: 480 });

      // 3. Add in the default keyboard controls
      //    along with joypad controls for touch
      Q.input.keyboardControls();
      Q.input.joypadControls();

      //Q.gravityX = 0;
      //Q.gravityY = 0;

      // 4. Add in a basic sprite to get started
      Q.Sprite.extend("Player", {
        init: function(p) {

          this._super(p,{
            sheet:"player"
          });

          this.add("2d");
        }
      });

      // 5. Put together a minimal level
      Q.scene("level1",function(stage) {
        var player = stage.insert(new Q.Player({ x: 48, y: 48 }));
      });

      // 6. Load and start the level
      Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
        Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

        Q.compileSheets("sprites.png","sprites.json");

        Q.stageScene("level1");
      });

    });
