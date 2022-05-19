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
  PeripheralManagerCentralDidSubscribeToCharacteristic,
  PeripheralManagerCentralDidUnsubscribeFromCharacteristic,
  PeripheralManagerIsReadyToUpdateSubscribers,
}: {
  PeripheralManagerDidUpdateStateEvent: string;
  PeripheralManagerCentralDidSubscribeToCharacteristic: string;
  PeripheralManagerCentralDidUnsubscribeFromCharacteristic: string;
  PeripheralManagerIsReadyToUpdateSubscribers: string;
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

export const CBCharacteristicProperty = {
  Broadcast: 0x01,
  Read: 0x02,
  WriteWithoutResponse: 0x04,
  Write: 0x08,
  Notify: 0x10,
  Indicate: 0x20,
  AuthenticatedSignedWrites: 0x40,
  ExtendedProperties: 0x80,
  NotifyEncryptionRequired: 0x100,
  IndicateEncryptionRequired: 0x200,
} as const;
export type CBCharacteristicProperty =
  typeof CBCharacteristicProperty[keyof typeof CBCharacteristicProperty];

export const CBAttributePermission = {
  Readable: 0x01,
  Writeable: 0x02,
  ReadEncryptionRequired: 0x04,
  WriteEncryptionRequired: 0x08,
} as const;
export type CBAttributePermission =
  typeof CBAttributePermission[keyof typeof CBAttributePermission];

export interface CBService {
  uuid: string;
  isPrimary: boolean;
  characteristics: CBCharacteristic[] | null;
}

export interface CBCharacteristic {
  uuid: string;
  value: string | null; // base64 encoded
  properties: CBCharacteristicProperty[];
  permissions: CBAttributePermission[];
}

export interface ICoreBluetooth extends NativeModule {
  createPeripheralManager(
    runInMainQueue: boolean,
    showPowerAlert: boolean,
    restoreIdentifier: string | null
  ): void;

  startAdvertising(serviceUUIDs: string[], localName: string | null): void;

  stopAdvertising(): void;

  state(): Promise<CBManagerState>;

  isAdvertising(): Promise<boolean>;

  addService(service: CBService): void;
}

export const CoreBluetooth: ICoreBluetooth = CoreBluetoothModule;
