"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Constant2 = exports.Constant1 = exports.CBUUIDCharacteristicUserDescriptionString = void 0;
exports.multiply = multiply;

var _reactNative = require("react-native");

const LINKING_ERROR = `The package 'react-native-core-bluetooth' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo managed workflow\n';
const CoreBluetooth = _reactNative.NativeModules.RNCoreBluetooth ? _reactNative.NativeModules.RNCoreBluetooth : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }

});
const {
  CBUUIDCharacteristicUserDescriptionString,
  Constant1,
  Constant2
} = CoreBluetooth.getConstants();
exports.Constant2 = Constant2;
exports.Constant1 = Constant1;
exports.CBUUIDCharacteristicUserDescriptionString = CBUUIDCharacteristicUserDescriptionString;

function multiply(a, b) {
  return CoreBluetooth.multiply(a, b);
}
//# sourceMappingURL=index.js.map