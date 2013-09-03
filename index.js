/*
 * Module dependencies
 */

var events = require('events');
var domify = require('domify');
var Emitter = require('emitter');
var tpl = domify(require('./template'));

/**
 * Export `EmulatePinch`
 */

module.exports = EmulatePinch;

/**
 * Initialize `EmulatePinch`
 *
 * @param {Element} el
 * @param {Function} fn
 * @return {EmulatePinch}
 * @api public
 */

function EmulatePinch(el, fn) {
  if (!(this instanceof EmulatePinch)) return new EmulatePinch(el, fn);
  this.el = el;
  this.fn = fn || function(){};
  this.midpoint = null;
  this.events = events(el, this);
  this.events.bind('click');
  this.dragging = false;
  this.fingers = [];
}

/**
 * Click
 *
 * @param {Event} e
 * @return {EmulatePinch}
 */

EmulatePinch.prototype.onclick = function(e) {
  var self = this;
  var x = e.pageX;
  var y = e.pageY;
  var finger = new Finger(x, y, this);
  var fingers = this.fingers;

  document.body.appendChild(finger.el);

  if (2 == fingers.length) {
    fingers.shift().remove();
  }

  fingers.push(finger);

  if (2 == fingers.length) {
    this.scale = 1;
    this.distance = distance(fingers[0].x, fingers[0].y, fingers[1].x, fingers[1].y);
    var mid = midpoint(fingers[0].x, fingers[0].y, fingers[1].x, fingers[1].y);
    var e = {};
    e.scale = 1;
    e.x = mid.x;
    e.y = mid.y;
    self.fn(e);
  }

  finger.on('change', function() {
    var dist = distance(fingers[0].x, fingers[0].y, fingers[1].x, fingers[1].y);
    var mid = midpoint(fingers[0].x, fingers[0].y, fingers[1].x, fingers[1].y);
    var e = {};
    e.scale = e.scale ? e.scale : dist / self.distance * self.scale;
    e.x = mid.x;
    e.y = mid.y;
    return self.fn(e);
  });

  finger.on('remove', function() {
    var i = fingers.indexOf(finger);
    if (~i) self.fingers.splice(i, 1);
  });

  return this;
};

/**
 * Unbind
 */

EmulatePinch.prototype.unbind = function() {
  for (var i = 0, len = this.fingers.length; i < len; i++) {
    this.fingers[i].remove();
  }

  this.events.unbind();
};

/**
 * Finger
 */

function Finger(x, y, mp) {
  if (!(this instanceof Finger)) return new Finger(x, y);
  var el = this.el = tpl.cloneNode(true);
  this.mp = mp;

  this.x = x;
  this.y = y;

  el.style.left = x + 'px';
  el.style.top = y + 'px';

  this.events = events(document.body, this);
  this.events.bind('dblclick');
  this.events.bind('mousedown');
  this.events.bind('mousemove');
  this.events.bind('mouseup');
}

/**
 * Mixin `Emitter`
 */

Emitter(Finger.prototype);

/**
 * Click on the finger
 */

Finger.prototype.ondblclick = function(e) {
  if (e.target !== this.el) return;
  this.remove();
};

/**
 * Move the finger
 */

Finger.prototype.onmousedown = function(e) {
  if (e.target !== this.el) return;
  this.mp.dragging = true;
  this.down = e;
};

/**
 * Mouse move
 */

Finger.prototype.onmousemove = function(e) {
  if (!this.down) return this;
  this.x = e.pageX;
  this.y = e.pageY;
  this.el.style.left = this.x + 'px';
  this.el.style.top = this.y + 'px';
  this.emit('change');
};

/**
 * Mouseup
 */

Finger.prototype.onmouseup = function(e) {
  if (!this.down) return this;
  this.mp.dragging = true;
  this.down = null;
  this.x = e.pageX;
  this.y = e.pageY;
  this.el.style.left = this.x + 'px';
  this.el.style.top = this.y + 'px';
};

/**
 * Remove finger
 */

Finger.prototype.remove = function() {
  if (!this.el.parentNode) return this;
  this.el.parentNode.removeChild(this.el);
  this.events.unbind();
  this.remove();
};

/**
 * Get the distance between two points
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {Number}
 * @api private
 */

function distance(x1, y1, x2, y2) {
  var x = Math.pow(x1 - x2, 2);
  var y = Math.pow(y1 - y2, 2);
  return Math.sqrt(x + y);
}

/**
 * Get the midpoint
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {Object} coords
 * @api private
 */

function midpoint(x1, y1, x2, y2) {
  var coords = {};
  coords.x = (x1 + x2) / 2;
  coords.y = (y1 + y2) / 2;
  return coords;
}
