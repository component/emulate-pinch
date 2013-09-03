
# emulate-pinch

  emulate [component/pinch](http://github.com/component/pinch) with your mouse

## Installation

  Install with [component(1)](http://component.io):

    $ component install component/emulate-pinch

## Example

```js
var pinch = require('emulate-pinch');

pinch(img, function(e) {
  dot.style.left = e.x + 'px';
  dot.style.top = e.y + 'px';
  dot.style['-webkit-transform'] = 'scale(' + e.scale + ')';
});
```

## API

### Pinch(el, fn)

Same API as [component/pinch](http://github.com/component/pinch).

## License

  MIT
