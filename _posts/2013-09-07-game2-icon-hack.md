---
layout: post
title: "Game #2: Icon Hack"
category: tutorial
modified: 2013-09-01
tags: [canvas 2d top-down rpg]
image:
  feature: icon-hack.png
---

* Game: Icon Hack
* Genre: Top-down RPG
* Clone of: Ultima

The next game on the list is Icon Hack, which is aimed at being a generic top-down RPG type game. The closest equivalent might be one of the old Ultima games, but this game is going to make no attempt to match the exact mechanics of that game. Rather, the game will be a generic RPG game with a few of the trimmings (some stats, inventory, scrolling, multiple-levels and a dungeon) to show how to organize a larger, multi-level game.

Step 1: Tearing out what we don't need.
=======================================

To start with, we'll use the Tower Man game from the last tutorial as a base, only with a bunch of code ripped out that we no longer need.

We can remove all the control code, as that'll be different in this game, and just use the stock `stepControls` for the player to move around. We'll do the same thing for the enemy sprite, removing the control component and the hit callback.

We'll also make a few changes to the TileLayer class, now called `HackMap`. The first change is that we'll be loading a TMX file called `countryside.tmx` instead of a hand-created level.json file. TMX files are created with the open-source [Tiled Map Editor](http://www.mapeditor.org/) and it sure beats creating JSON arrays by hand. 

The second change to `HackMap` is overriding the `collidableTile` method. By default any tile that isn't 0 counts as a tile that causes a collision, but for this game, we want to be able to use additional tiles for the background that the player can walk over. `collidableTile`'s job is to return true when a specific tile number should cause a collision. In this case we want stone and water tiles (1 and 2) to cause collisions and the rest not to.


```javascript
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
    init: function(p) {
      this._super(p,{
        type: SPRITE_TILES,
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
    var map = stage.collisionLayer(new Q.HackMap({ dataAsset: 'level.json' }));

    stage.insert(new Q.Player(Q.tilePos(1,1)));

    stage.insert(new Q.Enemy(Q.tilePos(10,4)));
    stage.insert(new Q.Enemy(Q.tilePos(16,10)));
    stage.insert(new Q.Enemy(Q.tilePos(5,10)));
  });

  Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 });

    Q.compileSheets("sprites.png","sprites.json");

    Q.stageScene("countryside");
  });

});
```

Add this code to a new project directory in a new `icon_hack.js` file and create the equivalent index.html referencing this .js file (otherwise the `index.html` file should match the one for Tower Man).

You'll need a new set of image and data assets you can [download](tester.zip) The sprite assets are taken from Mozilla's fantastic [BrowserQuest](https://github.com/mozilla/BrowserQuest) project

If you have everything in place, your game should now look something like below:

<div class='example-loader fixed' data-src='/icon_hack/index1.html'></div>

Fixing our offset problem
=========================

Right now we've got a little bit of a bounding box and an offset problem. Our sprites are wandering around and colliding with each other and the tiles, but the size of the sprites means there's a lot of white space around each sprite. Secondly the sprites aren't a top  


And your done....or not
=======================

The basic functionality for a simple Pac Man-like game is now complete - but the game itself is far from done.

It still needs multiple levels, scoring, and towers that turn enemies to let tower man gobble them up.

Now's your turn to add these - you can [fork the code base above on Mod.it](https://mod.it/ufciftb5/dev)

If you want to help the Quintus community you can also help by fixing any typos in the above tutorial or [forking the repo](https://github.com/cykod/HTML5GameTutorial) and extending this tutorial to add in any of the above-mentioned features.


