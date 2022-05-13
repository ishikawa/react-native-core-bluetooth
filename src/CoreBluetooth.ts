import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR =
  `The package 'react-native-core-bluetooth' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const CoreBluetoothModule = NativeModules.RNCoreBluetooth
  ? NativeModules.RNCoreBluetooth
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const {
  CBUUIDCharacteristicUserDescriptionString,
  Constant1,
  Constant2,
}: {
  CBUUIDCharacteristicUserDescriptionString: string;
  Constant1: string;
  Constant2: number;
} = CoreBluetoothModule.getConstants();

export interface CoreBluetoothInterface {
  createPeripheralManager(
    showPowerAlert: boolean,
    restoreIdentifier?: string
  ): void;

  startAdvertising(serviceUUIDs: string[], localName?: string): void;

  stopAdvertising(): void;

  multiply(a: number, b: number): Promise<number>;
}

export const CoreBluetooth: CoreBluetoothInterface = CoreBluetoothModule;
