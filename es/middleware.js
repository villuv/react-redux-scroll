var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import scrollTo from './scroll';

var dispatch = null;
var latestId = 1;
var subscriptions = {};
var isProd = process.env.NODE_ENV === 'production';

var clearSubscription = function clearSubscription(id) {
  if (subscriptions[id].running) subscriptions[id].cancelScroll();
  delete subscriptions[id];
};

var setRunning = function setRunning(id, value) {
  subscriptions[id].running = value;
};

export var subscribe = function subscribe(check, domEl, getContext, onEnd, scrollOptions) {
  // eslint-disable-next-line no-plusplus
  var subscriptionId = latestId++;
  subscriptions[subscriptionId] = {
    check: check,
    domEl: domEl,
    getContext: getContext,
    onEnd: onEnd,
    running: false,
    scrollOptions: scrollOptions
  };
  return function () {
    return clearSubscription(subscriptionId);
  };
};

var emit = function emit(action, state, prevState) {
  var takenContexts = new WeakSet();
  Object.keys(subscriptions).map(function (key) {
    return {
      key: key,
      options: subscriptions[key].check(action, state, prevState)
    };
  }).filter(function (_ref) {
    var options = _ref.options;
    return !!options;
  }).forEach(function (_ref2) {
    var key = _ref2.key,
        options = _ref2.options;

    var subscription = subscriptions[key];
    if (!takenContexts.has(subscription.getContext())) {
      takenContexts.add(subscription.getContext());
      setRunning(key, true);
      subscription.cancelScroll = scrollTo(subscription.domEl, subscription.getContext(), function (canceled) {
        setRunning(key, false);
        (options.onEnd || subscription.onEnd)(dispatch, canceled);
      }, _extends({}, subscription.scrollOptions, options.scrollOptions || {}));
    } else if (!isProd) {
      // eslint-disable-next-line no-console
      console.warn('A component was prevented from scrolling as a result of the ' + 'lastest action because another scroll was triggered ' + 'for the same context.');
    }
  });
};

export default (function () {
  return process.env.IS_SSR ? function () {
    return function (next) {
      return function (action) {
        return next(action);
      };
    };
  } : function (store) {
    dispatch = store.dispatch.bind(store);
    return function (next) {
      return function (action) {
        var prevState = store.getState();
        var result = next(action);
        emit(action, store.getState(), prevState);
        return result;
      };
    };
  };
});