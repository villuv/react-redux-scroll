'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Component) {
  if (process.env.IS_SSR) return Component;

  var ScrollableArea = function (_React$Component) {
    _inherits(ScrollableArea, _React$Component);

    function ScrollableArea(props) {
      _classCallCheck(this, ScrollableArea);

      var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.getScrollContext = _this.getScrollContext.bind(_this);
      _this._domNode = null;
      return _this;
    }

    ScrollableArea.prototype.getChildContext = function getChildContext() {
      return { getScrollContext: this.getScrollContext };
    };

    ScrollableArea.prototype.getScrollContext = function getScrollContext() {
      // eslint-disable-next-line react/no-find-dom-node
      var domNode = _reactDom2.default.findDOMNode(this._domNode);
      return domNode;
    };

    ScrollableArea.prototype.render = function render() {
      var _this2 = this;

      return _react2.default.createElement(Component, _extends({ ref: function ref(x) {
          return _this2._domNode = x;
        } }, this.props));
    };

    return ScrollableArea;
  }(_react2.default.Component);

  ScrollableArea.childContextTypes = {
    getScrollContext: _propTypes2.default.func
  };

  return (0, _hoistNonReactStatics2.default)(ScrollableArea, Component);
};