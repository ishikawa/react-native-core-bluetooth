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
  // For iOS only
  return withInfoPlist(c, (config) => {
    if (bluetoothAlwaysPermission !== false) {
      config.modResults.NSBluetoothAlwaysUsageDescription =
        bluetoothAlwaysPermission ||
        config.modResults.NSBluetoothAlwaysUsageDescription ||
        BLUETOOTH_ALWAYS;
    }
    // For apps with a deployment target of iOS 13 and later, use
    // NSBluetoothAlwaysUsageDescription instead.
    //
    // For deployment targets earlier than iOS 13, add both
    // NSBluetoothAlwaysUsageDescription and NSBluetoothPeripheralUsageDescription to
    // your app’s Information Property List file. Devices running earlier
    // versions of iOS rely on NSBluetoothPeripheralUsageDescription, while devices
    // running later versions rely on NSBluetoothAlwaysUsageDescription.
    if (bluetoothPeripheralPermission !== false) {
      config.modResults.NSBluetoothPeripheralUsageDescription =
        bluetoothPeripheralPermission ||
        config.modResults.NSBluetoothPeripheralUsageDescription ||
        // If NSBluetoothPeripheralUsageDescription is missing but
        // NSBluetoothAlwaysUsageDescription is present, use it as the default value.
        bluetoothAlwaysPermission ||
        config.modResults.NSBluetoothAlwaysUsageDescription ||
        BLUETOOTH_PERIPHERAL_USAGE;
    }
    return config;
  });
};

export default createRunOncePlugin(withCoreBluetooth, pkg.name, pkg.version);
