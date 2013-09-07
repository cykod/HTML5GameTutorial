---
layout: page
title: 
description: "A simple and clean responsive Jekyll theme for words and photos."
tags: [Jekyll, theme, themes, responsive, blog, minimalism]
---

**Warning:** this tutorial is in an early-Alpha form and is being released for comments and feedback - currently only 1 game exists, but more games will be added as they are written, but the entire tutorial will be undergoing significant structural changes as it's completed.

When I put a simple 80 line platformer up on the [Quintus Website](http://html5quintus.com), I was aware that people would probably use that example as a starter for platformer games with the Quintus Engine. What I didn't realize is that people would **only** use that example and build pretty much nothing but platformers with the Engine.

This tutorial is an attempt to fix that problem by showing the Engine used to build 9 different games. Furthermore the point of the tutorial is to show you that how subtle the implementation differences between different genres of games are - take a top down RPG-like game, add gravity and you have a side scroller. Take a 2D runner game, remove gravity, and suddenly you have a 2D space shooter. 

This tutorial will assume some basic familiarity with Quintus - so if you haven't read through the [Quintus Guide](http://html5quintus.com/guide/intro.md), I recommend you do that now (even just to give it a quick scan)

Additionally, the hope is that by playing with various pieces of the engines to build games in a gaggle of genres, you'll feel more comfortable with breaking out of specific genres of games and create the next indie world-beater.

The Tutorials
-------------

<ul class="post-list">
{% for post in site.posts limit:10 %} 
  <li><article><a href="{{ site.url }}{{ post.url }}">{{ post.title }} <span class="entry-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time></span></a></article></li>
{% endfor %}
</ul>
