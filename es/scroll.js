import ReactDOM from 'react-dom';

var onGoingScrolls = new WeakMap();

// Thanks to:
// http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
export var TIMING_FUNCTIONS = {
  LINEAR: function LINEAR(t) {
    return t;
  },
  EASE_IN_QUAD: function EASE_IN_QUAD(t) {
    return t * t;
  },
  EASE_OUT_QUAD: function EASE_OUT_QUAD(t) {
    return t * (2 - t);
  },
  EASE_IN_OUT_QUAD: function EASE_IN_OUT_QUAD(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  EASE_IN_CUBIC: function EASE_IN_CUBIC(t) {
    return Math.pow(t, 3);
  },
  EASE_OUT_CUBIC: function EASE_OUT_CUBIC(t) {
    return Math.pow(t - 1, 3) + 1;
  },
  EASE_IN_OUT_CUBIC: function EASE_IN_OUT_CUBIC(t) {
    return t < 0.5 ? 4 * Math.pow(t, 3) : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  EASE_IN_QUART: function EASE_IN_QUART(t) {
    return Math.pow(t, 4);
  },
  EASE_OUT_QUART: function EASE_OUT_QUART(t) {
    return 1 - Math.pow(t - 1, 4);
  },
  EASE_IN_OUT_QUART: function EASE_IN_OUT_QUART(t) {
    return t < 0.5 ? 8 * Math.pow(t, 4) : 1 - 8 * Math.pow(t - 1, 4);
  }
};

export var ALIGNMENTS = Object.freeze({
  CENTER: 'CENTER',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM'
});

var getCurrentPosition = function getCurrentPosition(from, to, startTime, duration, fn) {
  var percentageTime = duration === 0 ? 1 : (Date.now() - startTime) / duration;
  if (percentageTime >= 1) return to;

  var percentagePosition = fn(percentageTime);
  return {
    x: from.x + (to.x - from.x) * percentagePosition,
    y: from.y + (to.y - from.y) * percentagePosition
  };
};

var requestAnimationFrame = function requestAnimationFrame(animationFn) {
  return (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
    return window.setTimeout(fn, 20);
  })(animationFn);
};

var cancelAnimationFrame = function cancelAnimationFrame(animationId) {
  return (window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || function (id) {
    return window.clearTimeout(id);
  })(animationId);
};

var clearEntry = function clearEntry(context, isCancellation) {
  var _onGoingScrolls$get = onGoingScrolls.get(context),
      animationId = _onGoingScrolls$get.animationId,
      onEnd = _onGoingScrolls$get.onEnd;

  if (isCancellation) cancelAnimationFrame(animationId);
  onEnd(isCancellation);
  onGoingScrolls.delete(context);
};

var getEntity = function getEntity(context, onEnd) {
  if (onGoingScrolls.has(context)) {
    clearEntry(context, true);
  }
  var entity = { onEnd: onEnd };
  onGoingScrolls.set(context, entity);
  return entity;
};

export default (function (target, ctx) {
  var onEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return null;
  };

  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      _ref$duration = _ref.duration,
      duration = _ref$duration === undefined ? 500 : _ref$duration,
      _ref$transitionTiming = _ref.transitionTimingFunction,
      transitionTimingFunction = _ref$transitionTiming === undefined ? 'EASE_IN_QUAD' : _ref$transitionTiming,
      _ref$xAlignment = _ref.xAlignment,
      xAlignment = _ref$xAlignment === undefined ? null : _ref$xAlignment,
      _ref$xMargin = _ref.xMargin,
      xMargin = _ref$xMargin === undefined ? 0 : _ref$xMargin,
      _ref$yAlignment = _ref.yAlignment,
      yAlignment = _ref$yAlignment === undefined ? 'TOP' : _ref$yAlignment,
      _ref$yMargin = _ref.yMargin,
      yMargin = _ref$yMargin === undefined ? 0 : _ref$yMargin;

  var context = ctx || window;
  var entity = getEntity(context, onEnd);

  var from = context === window ? { x: window.pageXOffset, y: window.pageYOffset } : { x: context.scrollLeft, y: context.scrollTop };

  var contextRect = context === window ? {
    width: window.innerWidth,
    height: window.innerHeight,
    left: 0,
    top: 0,
    scrollLeft: 0,
    scrollTop: 0
  } : context.getBoundingClientRect();

  // eslint-disable-next-line
  var targetNode = ReactDOM.findDOMNode(target);
  if (!targetNode) {
    return;
  }
  var targetRect = targetNode.getBoundingClientRect();

  var to = {
    x: (xAlignment === ALIGNMENTS.CENTER ? targetRect.left + (targetRect.width - contextRect.width) / 2 : xAlignment === ALIGNMENTS.LEFT ? targetRect.left // eslint-disable-line no-multi-spaces
    : xAlignment === ALIGNMENTS.RIGHT ? targetRect.right - contextRect.width : contextRect.left) + from.x - (contextRect.left + xMargin),
    y: (yAlignment === ALIGNMENTS.CENTER ? targetRect.top + (targetRect.height - contextRect.height) / 2 : yAlignment === ALIGNMENTS.TOP ? targetRect.top // eslint-disable-line no-multi-spaces
    : yAlignment === ALIGNMENTS.BOTTOM ? targetRect.bottom - contextRect.height : contextRect.top) + from.y - (contextRect.top + yMargin)
  };

  var scrollTo = context === window ? window.scroll.bind(window) : function (x, y) {
    context.scrollLeft = x; // eslint-disable-line no-param-reassign
    context.scrollTop = y; // eslint-disable-line no-param-reassign
  };

  var timingFn = typeof transitionTimingFunction === 'function' ? transitionTimingFunction : TIMING_FUNCTIONS[transitionTimingFunction] || TIMING_FUNCTIONS.EASE_IN_QUAD;

  var start = Date.now();

  var scroll = function scroll() {
    var currentPosition = getCurrentPosition(from, to, start, duration, timingFn);
    scrollTo(currentPosition.x, currentPosition.y);
    if (currentPosition.x === to.x && currentPosition.y === to.y) {
      clearEntry(context, false);
    } else {
      entity.animationId = requestAnimationFrame(scroll);
    }
  };
  scroll();
  return function () {
    return clearEntry(context, true);
  };
});