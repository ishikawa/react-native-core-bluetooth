import { NativeModules, Platform, NativeModule } from 'react-native';
const LINKING_ERROR =
  `The package 'react-native-core-bluetooth' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const CoreBluetoothModule = NativeModules.CoreBluetooth
  ? NativeModules.CoreBluetooth
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const {
  PeripheralManagerDidUpdateStateEvent,
}: {
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

export interface CoreBluetoothInterface extends NativeModule {
  createPeripheralManager(
    runInMainQueue: boolean,
    showPowerAlert: boolean,
    restoreIdentifier: string | null
  ): void;

  startAdvertising(serviceUUIDs: string[], localName: string | null): void;

  stopAdvertising(): void;

  peripheralManagerState(): Promise<CBManagerState>;
}

export interface CoreBluetoothEventEmitterInterface {
  fireEvent(body: string): void;
}

export const CoreBluetooth: CoreBluetoothInterface = CoreBluetoothModule;
