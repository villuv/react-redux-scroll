var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import hoistStatics from 'hoist-non-react-statics';
import { subscribe } from './middleware';

var getMatcher = function getMatcher(pattern) {
  var patternType = typeof pattern;
  if (patternType === 'string') return function (_ref) {
    var type = _ref.type;
    return type === pattern;
  };
  if (patternType === 'function') return pattern;
  if (Array.isArray(pattern)) {
    return function () {
      var val = void 0;
      for (var i = 0; !val && i < pattern.length; i += 1) {
        val = getMatcher(pattern[i]).apply(undefined, arguments);
      }
      return val;
    };
  }

  throw new Error('ScrollToWhen expected a string, a function or an Array of patterns as the pattern parameter, instead it received ' + patternType);
};

var getArgs = function getArgs(args) {
  if (args.length === 0) throw new Error('scrollToWhen HOC expects at least 1 argument');
  if (args.length > 1) return args;
  if (typeof args[0] !== 'object') return args;
  return [args[0].pattern, args[0].onEnd, args[0].scrollOptions, args[0].excludedProps];
};

export default (function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (Component) {
    if (process.env.IS_SSR) return Component;

    var _getArgs$map = getArgs(args).map(function (x) {
      return x === null ? undefined : x;
    }),
        pattern = _getArgs$map[0],
        _getArgs$map$ = _getArgs$map[1],
        onEnd = _getArgs$map$ === undefined ? Function.prototype : _getArgs$map$,
        _getArgs$map$2 = _getArgs$map[2],
        scrollOptions = _getArgs$map$2 === undefined ? {} : _getArgs$map$2,
        _getArgs$map$3 = _getArgs$map[3],
        excludedProps = _getArgs$map$3 === undefined ? [] : _getArgs$map$3;

    var matcher = getMatcher(pattern);

    var Scrollable = function (_React$Component) {
      _inherits(Scrollable, _React$Component);

      function Scrollable(props, context) {
        _classCallCheck(this, Scrollable);

        var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

        _this._domNode = null;
        _this.check = _this.check.bind(_this);
        _this.subscription = Function.prototype;
        return _this;
      }

      Scrollable.prototype.componentDidMount = function componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        this._domNode = this._domNode || ReactDOM.findDOMNode(this);
        this.subscription = subscribe(this.check, this._domNode, this.context.getScrollContext || function () {
          return window;
        }, onEnd, scrollOptions);
      };

      Scrollable.prototype.componentWillUnmount = function componentWillUnmount() {
        this.subscription();
      };

      Scrollable.prototype.check = function check(action, state, prevState) {
        return matcher(action, this.props, state, prevState);
      };

      Scrollable.prototype.render = function render() {
        var _this2 = this;

        var newProps = excludedProps.length > 0 ? _extends({}, this.props) : this.props;
        excludedProps.forEach(function (key) {
          return delete newProps[key];
        });
        return React.createElement(Component, _extends({ ref: function ref(x) {
            return _this2._domNode = x;
          } }, newProps));
      };

      return Scrollable;
    }(React.Component);

    Scrollable.contextTypes = { getScrollContext: PropTypes.func };

    return hoistStatics(Scrollable, Component);
  };
});