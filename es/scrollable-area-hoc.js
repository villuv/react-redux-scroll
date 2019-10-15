var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';
import hoistStatics from 'hoist-non-react-statics';
import ReactDOM from 'react-dom';

export default (function (Component) {
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

    ScrollableArea.prototype.componentDidMount = function componentDidMount() {
      // eslint-disable-next-line react/no-find-dom-node
      this._domNode = ReactDOM.findDOMNode(this._domNode);
    };

    ScrollableArea.prototype.getScrollContext = function getScrollContext() {
      return this._domNode;
    };

    ScrollableArea.prototype.render = function render() {
      var _this2 = this;

      return React.createElement(Component, _extends({ ref: function ref(x) {
          return _this2._domNode = x;
        } }, this.props));
    };

    return ScrollableArea;
  }(React.Component);

  ScrollableArea.childContextTypes = {
    getScrollContext: PropTypes.func
  };

  return hoistStatics(ScrollableArea, Component);
});