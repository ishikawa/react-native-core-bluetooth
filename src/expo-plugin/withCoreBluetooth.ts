// borrowed from https://github.com/expo/config-plugins/tree/main/packages/react-native-ble-plx
import {
  withInfoPlist,
  ConfigPlugin,
  createRunOncePlugin,
} from '@expo/config-plugins';
const pkg = require('../../../package.json');

const BLUETOOTH_ALWAYS =
  'Allow $(PRODUCT_NAME) to connect to bluetooth devices';
const BLUETOOTH_PERIPHERAL_USAGE =
  'Allow $(PRODUCT_NAME) to connect to bluetooth devices';

/**
 * Apply BLE configuration for Expo SDK 42 projects.
 */
const withCoreBluetooth: ConfigPlugin<
  {
    bluetoothAlwaysPermission?: string | false;
    bluetoothPeripheralPermission?: string | false;
  } | void
> = (c, { bluetoothAlwaysPermission, bluetoothPeripheralPermission } = {}) => {
  // iOS only supported
  return withInfoPlist(c, (config) => {
    if (bluetoothAlwaysPermission !== false) {
      config.modResults.NSBluetoothAlwaysUsageDescription =
        bluetoothAlwaysPermission ||
        config.modResults.NSBluetoothAlwaysUsageDescription ||
        BLUETOOTH_ALWAYS;
    }
    if (bluetoothPeripheralPermission !== false) {
      config.modResults.NSBluetoothPeripheralUsageDescription =
        bluetoothPeripheralPermission ||
        config.modResults.NSBluetoothPeripheralUsageDescription ||
        BLUETOOTH_PERIPHERAL_USAGE;
    }
    return config;
  });
};

export default createRunOncePlugin(withCoreBluetooth, pkg.name, pkg.version);
