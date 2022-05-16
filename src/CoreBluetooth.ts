import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
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
  // Event names
  PeripheralManagerDidUpdateStateEvent,
}: {
  CBUUIDCharacteristicUserDescriptionString: string;
  Constant1: string;
  Constant2: number;
  // Event names
  PeripheralManagerDidUpdateStateEvent: string;
} = CoreBluetoothModule.getConstants();

export const CBManagerState = {
  Unknown: 0,
  Resetting: 1,
  Unsupported: 2,
  Unauthorized: 3,
  PoweredOff: 4,
  PoweredOn: 5,
} as const;
export type CBManagerState = typeof CBManagerState[keyof typeof CBManagerState];

export interface CoreBluetoothInterface {
  createPeripheralManager(
    showPowerAlert: boolean,
    restoreIdentifier: string | null
  ): void;

  startAdvertising(serviceUUIDs: string[], localName: string | null): void;

  stopAdvertising(): void;

  peripheralManagerState(): Promise<CBManagerState>;

  multiply(a: number, b: number): Promise<number>;

  fireUpdateEvent(): void;
}

export const CoreBluetooth: CoreBluetoothInterface = CoreBluetoothModule;

export const CoreBluetoothEventEmitter = new NativeEventEmitter(
  CoreBluetoothModule
);
