---
layout: post
title: "Game #1: Tower Man"
category: tutorial
modified: 2013-09-01
tags: [canvas 2d top-down]
image:
  feature: tower_man.png
---

* Game: Tower Man
* Genre: Top-down action
* Clone of: Pac Man

First a moment of reflection on the Genre: what is a Pac Man type game? The answer is that it's a top-down action game. A player moves in fixed 2D board while enemies chase him in real-time.

Other top down action games include games like Bomberman and shooters like Ikari warriors (for those of you with a NES background)

Our clone, Tower Man, will be different than Pac Man in a number of ways, but the main gameplay experience will be pretty similar.

As this is the first game in the set, it'll also be the simplest from a graphics and animation perspective - we're going to use a minimal sprite sheet, and no animation. 

The sprite sheet for Tower Man consists of 4 sprites: the player, the enemy, the dots and the towers. The goal of the game is to get all four towers and all the dots. I don't know what the dots represent in the game's universe, but let's just go with it.

To keep things simple as we get going, we'll be using the absolute minimal number of modules we can get away with and still make a game:

* `Sprites` - for adding sprites  onto the screen
* `Scenes` - for handling multiple sprites and dealing with collision detection.
* `Input` - so we can use the keyboard and touch screen to move.
* `2D` - for the TileLayer so we don't have to build the whole gameboard out of sprites.


Step 1: Getting something on the screen
---------------------------------------

The first step in any game is to get **something** onto the screen and work from there. We'll be starting with the standard minimal Quintus setup. Add the code below to a `tower_man.js` file in a new project directory.


```javascript
// 1. Wait for the onload event
window.addEventListener("load",function() {

  // 2. Set up a basic Quintus object
  //    with the necessary modules and controls
  //    to make things easy, we're going to fix this game at 640x480
  var Q = window.Q = Quintus({ development: true })
          .include("Sprites, Scenes, Input, 2D")
          .setup({ width: 640, height: 480 });

  // 3. Add in the default keyboard controls
  //    along with joypad controls for touch
  Q.input.keyboardControls();
  Q.input.joypadControls();

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
  Q.load("sprites.png, sprites.json, level.json", function() {
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });

});
```

Next you'll need a minimal HTML file as well, this one should do - add it as the `index.html` file in the same directory as your `tower_man.js` file.

```html
<!DOCTYPE HTML>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=640, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0"/>
    <title>Tower man</title>
    <script src='http://cdn.html5quintus.com/v0.1.6/quintus-all.js'></script>
    <script src='tower_man.js'></script>
    <style> body { padding:0px; margin:0px; background-color:black ; }  </style>
  </head>
  <body></body>
</html>
```

Plop those suckers in a directory along with the contents of [tower\_man\_assets.zip](/tower_man/tower_man_assets.zip), run them from localhost and you should get the result you see below (a single sprite falling down the game):

<div class='example-loader fixed' data-src='/tower_man/index1.html'></div>

**Note:** generally all the examples need to be run from a server (http://) not a file (file://) url. The reason for this is that data assets are JSON files that are loaded Ajax, and browsers have security restrictions when running from file:// urls (imagine you loaded an HTML file you downloaded and it immediately started uploading your whole computer to some hackers website? not ideal, hence the restriction.) 

What's going on here? Well, we've got a single sprite added into the game that has its sprite sheet set to "player". The sprite will use this to determine its size (32x32) and the sprite to display.

Next we add the `2d` component to the sprite - this adds in basic 2d collisions as well as some basic 2d kinetics (velocity and acceleration) By default the `2d` module sets a downward gravity in, which in this case we don't want. So, onto step 2.

Step 2: Getting rid of gravity
=====================

Since this is a top-down game, gravity needs to get thrown out the window.

To remove gravity, let's set `Q.gravityY` to zero so our player doesn't fall. Add the following two lines below the input lines shown below:


```javascript
Q.input.keyboardControls();
Q.input.joypadControls();

// Add these two lines below the controls
Q.gravityY = 0;
Q.gravityX = 0;
```

This will set the global gravity parameters for the game. Sprites also have a local gravity parameter - `p.gravityX` / `p.gravityY` that can be used to override global gravity. (Setting `Q.gravityX` to 0 isn't strictly necessary as it's already zero - but that way you can play around with it)

Rerun the game and you should have a non-falling player. If you want to see the effects of gravity, go ahead and play around with those `Q.gravityX` and `Q.gravityY` properties.


Step 3: Getting some constants
======================

Collisions are a little complicated for tower man, so let's create our own constants to make it easier to work out the bit masks we need:

```javascript
Q.gravityX = 0;
Q.gravityY = 0;

// Add these below the gravity statements
var SPRITE_PLAYER = 1;
var SPRITE_TILES = 2;
var SPRITE_ENEMY = 4;
var SPRITE_DOT = 8;
```

Quintus ships with a number of constants in `Quintus.Sprites` but often in your own games it's better to define a set of constants that make sense for your game. These are used to generate bitmasks which control what other types of sprites a sprite collides with.

In the case of the player - it'll collide with `SPRITE_TILES | SPRITE_ENEMY | SPRITE_DOT` while the enemies will only collide with `SPRITE_TILES | SPRITE_PLAYER`

Now we have separate masks for the player, the background tiles, the enemies and the dots.

Step 4: Adding in a level
=================

A black background isn't going to cut it as a level - we're going to need to add in some sort of level. To do this we're going use the `Q.TileLayer`, but we're going to create a derived class that adds in sprites for the dots and towers so we don't need to add them in manually.

We're going to cheat on the dots and towers - they'll actually be the same sprite, just with a different sprite sheet. 

**Note**: If the tutorial is ever not explicit as to where you should add in code, you can just add it anywhere inside of the `window.addEventListener` before the final `Q.load` statement.

Add the following two sprites into your game:

```javascript
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
    this.stage.dotCount = this.stage.dotCount || 0;
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
```

Next we need the actual level class - we'll call this `Q.TowerManMap` and it'll be a basic tile layer with a custom `setup()` function.

This setup function will create a copy of the tile data passed in and then modify it to add in towers and dots where appropriate, changing those tiles to be empty.

We need to make sure that we use a copy of the tile data otherwise the next time the level is loaded, the data for the tiles (an array of arrays) will be changed.

We also add in a little helper method to get tile locations for us:


```javascript
// Return a x and y location from a row and column
// in our tile map
Q.tilePos = function(col,row) {
  return { x: col*32 + 16, y: row*32 + 16 };
}


Q.TileLayer.extend("TowerManMap",{
  init: function(p) {
    this._super(p,{
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

        // Replace 0's with dots and 2's with Towers
        if(tile == 0 || tile == 2) {
          var className = tile == 0 ? 'Dot' : 'Tower'
          this.stage.insert(new Q[className](Q.tilePos(x,y)));
          row[x] = 0;
        }
      }
    }
  }
});
```

When setup is called on the `TowerManMap` it loops over each of the tiles and replaces any 0 tiles with Dot Sprites and any 2 tiles withs Tower Sprites. It then sets the corresponding tile values to 0 so no tile shows up there.

To see this in action, replace the scene and load calls at the bottom of the file with the code below, which adds in the `TowerManMap` and the `Q.sheet` call to setup the tile map.

```javascript
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
```

If everything goes according to plan, you should have a static level filled with dots, towers and the player as shown below.

<div class='example-loader fixed' data-src='/tower_man/index2.html'></div>

Step 5: Adding in controls
==================

At first glance it seems like adding in some player controls should be a snap - but the original controls for Pac Man were actually a little more subtle than you might think.

You can play a version of [PacMan Google Doodle](http://www.google.com/doodles/30th-anniversary-of-pac-man) if you need to remind yourself.

PacMan generally keeps moving in whatever direction he's facing until he hits a wall. But let's say you're moving up - if you try to go right before it's time, he'll keep moving up until there's a gap he can go through, however if there's no gap he'll just sit in the corner.

To translate this to programmatic terms, we need to keep track of the direction we're going and the direction we'd like to go. While this might seem complicated, there's actually a pretty simple implementation of this: we just use `p.vx` and `p.vy` to keep track of the direction we're going and a separate `p.direction` property to keep track of the direction we'd like to go.

Since Quintus will automatically remove any velocity in a direction where there's a collision, we just need to keep adding velocity in the direction we'd like to go until we actually can go that way.

Let's turn that idea into a component we can add onto our player:

```javascript
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
```


Next let's update the `Q.Player` class to use the component and set a `p.type` and `p.collisionMask` so that the player collides with the walls, dots and eventual enemies.

```javascript
Q.Sprite.extend("Player", {
  init: function(p) {

    this._super(p,{
      sheet:"player",
      // Add in a type and collisionMask
      type: SPRITE_PLAYER, 
      collisionMask: SPRITE_TILES | SPRITE_ENEMY | SPRITE_DOT
    });

    // Add in the towerManControls component in addition
    // to the 2d component
    this.add("2d, towerManControls");
  }
});
```

If you fire up the game now you should have a tower man that can pick up dots and towers.

<div class='example-loader fixed' data-src='/tower_man/index3.html'></div>

Step 6: Adding in enemies
================

While we want everyone to feel like a winner, a game without enemies isn't a whole lot of fun. Let's add a few bad folks to make it a little more exciting.

Once again we're going to separate out the movement logic for the enemy from the enemy itself. The code for the enemy movement logic has a lot of parallels to the logic for the player, except that the enemies move randomly, not based on the whims of the user.

The basic logic has two parts. The first part randomly changes the direction of the enemy - picking a direction 90 degrees away from the current direction of motion a small percentage of the time. The second part tries to turn the enemy whenever there's a collision and the enemy isn't moving (which means the enemy has gotten stuck in on a wall)

The code for this component is below:

```javascript
Q.component("enemyControls", {
  defaults: { speed: 100, direction: 'left', switchPercent: 2 },

  added: function() {
    var p = this.entity.p;

    Q._defaults(p,this.defaults);

    this.entity.on("step",this,"step");
    this.entity.on('hit',this,"changeDirection");
  },

  step: function(dt) {
    var p = this.entity.p;

    // Randomly try to switch directions
    if(Math.random() < p.switchPercent / 100) {
      this.tryDirection();
    }

    // Add velocity in the direction we are currently heading.
    switch(p.direction) {
      case "left": p.vx = -p.speed; break;
      case "right":p.vx = p.speed; break;
      case "up":   p.vy = -p.speed; break;
      case "down": p.vy = p.speed; break;
    }
  },

  // Try a random direction 90 degrees away from the 
  // current direction of movement
  tryDirection: function() {
    var p = this.entity.p; 
    var from = p.direction;
    if(p.vy != 0 && p.vx == 0) {
      p.direction = Math.random() < 0.5 ? 'left' : 'right';
    } else if(p.vx != 0 && p.vy == 0) {
      p.direction = Math.random() < 0.5 ? 'up' : 'down';
    }
  },

  // Called every collision, if we're stuck,
  // try moving in a direction 90 degrees away from the normal
  changeDirection: function(collision) {
    var p = this.entity.p;
    if(p.vx == 0 && p.vy == 0) {
      if(collision.normalY) {
        p.direction = Math.random() < 0.5 ? 'left' : 'right';
      } else if(collision.normalX) {
        p.direction = Math.random() < 0.5 ? 'up' : 'down';
      }
    }
  }
});
```

Next we need the code for the enemy itself - this is nothing but a simple sprite with the `enemyControls` component and a `hit.sprite` event listener that checks if it's the player who's been hit. If it is the player, restart the game.


```javascript
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
```

Finally in order to actually add enemies into the game - we'll need to add some enemies onto the stage in the `level1` scene. Add the three lines shown below into the scene method to round out the basic functionality: 

```javascript
Q.scene("level1",function(stage) {
  var map = stage.collisionLayer(new Q.TowerManMap());
  map.setup();

  stage.insert(new Q.Player(Q.tilePos(10,7)));

  // Add in some enemies with the lines below
  stage.insert(new Q.Enemy(Q.tilePos(10,4)));
  stage.insert(new Q.Enemy(Q.tilePos(15,10)));
  stage.insert(new Q.Enemy(Q.tilePos(5,10)));
});
```

You can see the final game below:

<div class='example-loader fixed' data-src='/tower_man/index4.html'></div>

And you're done....or not
=======================

The basic functionality for a simple Pac Man-like game is now complete - but the game itself is far from done.

It still needs multiple levels, scoring, and towers that turn enemies to let tower man gobble them up.

Now's your turn to add these - you can [fork the code base above on Mod.it](https://mod.it/ufciftb5/dev)

If you want to help the Quintus community you can also help by fixing any typos in the above tutorial or [forking the repo](https://github.com/cykod/HTML5GameTutorial) and extending this tutorial to add in any of the above-mentioned features.


