import { NativeEventEmitter } from 'react-native';
import {
  CoreBluetooth,
  CBManagerState,
  PeripheralManagerDidUpdateStateEvent,
} from './CoreBluetooth';

export interface IEventSubscription {
  /**
   * Removes this subscription from the subscriber that controls it.
   */
  remove(): void;
}

export interface IStateChangeListener {
  (state: ManagerState): void;
}

export type AdvertisingOptions = {
  localName?: string;
};

// The possible states of a Core Bluetooth manager.
export type ManagerState =
  | 'Unknown'
  | 'Resetting'
  | 'Unsupported'
  | 'Unauthorized'
  | 'PoweredOff'
  | 'PoweredOn';

function CBManagerStateToManagerState(value: CBManagerState): ManagerState {
  switch (value) {
    case CBManagerState.Unknown:
      return 'Unknown';
    case CBManagerState.Resetting:
      return 'Resetting';
    case CBManagerState.Unsupported:
      return 'Unsupported';
    case CBManagerState.Unauthorized:
      return 'Unauthorized';
    case CBManagerState.PoweredOff:
      return 'PoweredOff';
    case CBManagerState.PoweredOn:
      return 'PoweredOn';
  }
}

/**
 * CBPeripheralManager
 * https://developer.apple.com/documentation/corebluetooth/cbperipheralmanager
 *
 * An object that manages and advertises peripheral services exposed by this app.
 */
export class PeripheralManager {
  #isAdvertising = false;

  #emitter = new NativeEventEmitter(CoreBluetooth);

  constructor() {
    CoreBluetooth.createPeripheralManager(false, true, null);
  }

  async state(): Promise<ManagerState> {
    const value = await CoreBluetooth.peripheralManagerState();
    return CBManagerStateToManagerState(value);
  }

  onStateChange(listener: IStateChangeListener): IEventSubscription {
    const subscription = this.#emitter.addListener(
      PeripheralManagerDidUpdateStateEvent,
      (event) => {
        console.debug(
          'Event',
          PeripheralManagerDidUpdateStateEvent,
          'received with',
          event
        );
        const state = CBManagerStateToManagerState(event.state);
        listener(state);
      }
    );

    return subscription;
  }

  /**
   * Advertises peripheral manager data.
   */
  startAdvertising(serviceUUIDs: string[], options?: AdvertisingOptions) {
    CoreBluetooth.startAdvertising(serviceUUIDs, options?.localName ?? null);
    this.#isAdvertising = true;
  }

  stopAdvertising() {
    CoreBluetooth.stopAdvertising();
    this.#isAdvertising = false;
  }

  /**
   * A Boolean value that indicates whether the peripheral is advertising data.
   *
   * This value is `true` if the peripheral is advertising data as a result of
   * successfully calling the `startAdvertising()` method. The value is `false`
   * if the peripheral is no longer advertising its data.
   */
  get isAdvertising(): boolean {
    return this.#isAdvertising;
  }
}
