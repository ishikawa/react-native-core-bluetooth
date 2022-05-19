import { NativeEventEmitter } from 'react-native';
import {
  CoreBluetooth,
  CBManagerState,
  PeripheralManagerDidUpdateStateEvent,
  CBCharacteristicProperty,
  CBAttributePermission,
} from './CoreBluetooth';
import * as Base64 from 'base64-js';

export interface IEventSubscription {
  /**
   * Removes this subscription from the subscriber that controls it.
   */
  remove(): void;
}

export interface IStateChangeListener {
  (state: ManagerState): void;
}

export type PeripheralManagerOptions = {
  runInMainQueue?: boolean;
  showPowerAlert?: boolean;
  restoreIdentifier?: string | null;
};

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
  #emitter = new NativeEventEmitter(CoreBluetooth);

  constructor(options: PeripheralManagerOptions = {}) {
    CoreBluetooth.createPeripheralManager(
      options.runInMainQueue ?? false,
      options.showPowerAlert ?? true,
      options.restoreIdentifier ?? null
    );
  }

  async state(): Promise<ManagerState> {
    const value = await CoreBluetooth.state();
    return CBManagerStateToManagerState(value);
  }

  /**
   * Returns `true` if the peripheral is advertising data.
   *
   * This value is `true` if the peripheral is advertising data as a result of
   * successfully calling the `startAdvertising()` method. The value is `false`
   * if the peripheral is no longer advertising its data.
   *
   * @returns A Boolean value that indicates whether the peripheral is advertising data.
   */
  isAdvertising(): Promise<boolean> {
    return CoreBluetooth.isAdvertising();
  }

  /**
   * Tells the listener the peripheral manager’s state updated.
   *
   * Before you call PeripheralManager methods, the peripheral manager object must be in
   * the powered-on state, as indicated by the `ManagerState.PoweredOn`.
   * This state indicates that the device (your iPhone or iPad, for instance) supports
   * Bluetooth low energy and that its Bluetooth is on and available for use.
   *
   * @param listener A callback.
   * @returns An event subscription.
   */
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
  }

  stopAdvertising() {
    CoreBluetooth.stopAdvertising();
  }

  /**
   * Publishes a service and any of its associated characteristics and characteristic
   * descriptors to the local GATT database.
   *
   * @param service a service to publish.
   */
  addService(service: Service) {
    CoreBluetooth.addService({
      uuid: service.UUID,
      isPrimary: service.isPrimary,
      characteristics:
        service.characteristics?.map((c) => ({
          uuid: c.UUID,
          value: c.value ? Base64.fromByteArray(c.value) : null,
          properties: c.properties.map((p) =>
            CharacteristicPropertyToCBCharacteristicProperty(p)
          ),
          permissions: c.permissions.map((p) =>
            AttributePermissionToCBAttributePermission(p)
          ),
        })) ?? null,
    });
  }
}

/**
 * Characteristic properties determine how the characteristic value can be used,
 * or how the descriptor(s) can be accessed. Can be combined. Unless otherwise
 * specified, properties are valid for local characteristics published PeripheralManager.
 */
export type CharacteristicProperty =
  /**
   * Permits broadcasts of the characteristic value using a characteristic configuration
   * descriptor. Not allowed for local characteristics.
   */
  | 'broadcast'
  /**
   * Permits reads of the characteristic value.
   */
  | 'read'
  /**
   * Permits writes of the characteristic value, without a response.
   */
  | 'writeWithoutResponse'
  /**
   * Permits writes of the characteristic value.
   */
  | 'write'
  /**
   * Permits notifications of the characteristic value, without a response.
   */
  | 'notify'
  /**
   * Permits indications of the characteristic value.
   */
  | 'indicate'
  /**
   * Permits signed writes of the characteristic value
   */
  | 'authenticatedSignedWrites'
  /**
   * If set, additional characteristic properties are defined in the characteristic
   * extended properties descriptor. Not allowed for local characteristics.
   */
  | 'extendedProperties'
  /**
   * If set, only trusted devices can enable notifications of the characteristic value.
   */
  | 'notifyEncryptionRequired'
  /**
   * If set, only trusted devices can enable indications of the characteristic value.
   */
  | 'indicateEncryptionRequired';

function CharacteristicPropertyToCBCharacteristicProperty(
  cp: CharacteristicProperty
): CBCharacteristicProperty {
  switch (cp) {
    case 'broadcast':
      return CBCharacteristicProperty.Broadcast;
    case 'read':
      return CBCharacteristicProperty.Read;
    case 'writeWithoutResponse':
      return CBCharacteristicProperty.WriteWithoutResponse;
    case 'write':
      return CBCharacteristicProperty.Write;
    case 'notify':
      return CBCharacteristicProperty.Notify;
    case 'indicate':
      return CBCharacteristicProperty.Indicate;
    case 'authenticatedSignedWrites':
      return CBCharacteristicProperty.AuthenticatedSignedWrites;
    case 'extendedProperties':
      return CBCharacteristicProperty.ExtendedProperties;
    case 'notifyEncryptionRequired':
      return CBCharacteristicProperty.NotifyEncryptionRequired;
    case 'indicateEncryptionRequired':
      return CBCharacteristicProperty.IndicateEncryptionRequired;
  }
}

/**
 * Values that represent the read, write, and encryption permissions for a characteristic’s value.
 *
 * When you initialize a new mutable characteristic, you set the read, write, and encryption
 * permissions for the characteristic’s value. Setting the read and write permissions for
 * a characteristic’s value is different from specifying the read and write properties for
 * a characteristic’s value. When you specify the read and write properties, the client (a central)
 * inspects the read and write permissions of the characteristic’s value. When you specify
 * the read and write permissions for a characteristic’s value, you set the permissions for
 * the server (the peripheral) to allow the type of read or write specified by
 * the characteristic’s properties. Therefore, when you initialize a mutable characteristic,
 * you need to specify read or write properties and their corresponding permissions.
 *
 * If you want to enforce encryption requirements for reads and writes on a characteristic’s value,
 * you must specify the relevant permission (CBAttributePermissionsReadEncryptionRequired or
 * CBAttributePermissionsWriteEncryptionRequired). You may set more than one permission for
 * a characteristic’s value.
 */
export type AttributePermission =
  | 'readable'
  | 'writeable'
  | 'readEncryptionRequired'
  | 'writeEncryptionRequired';

function AttributePermissionToCBAttributePermission(
  ap: AttributePermission
): CBAttributePermission {
  switch (ap) {
    case 'readable':
      return CBAttributePermission.Readable;
    case 'writeable':
      return CBAttributePermission.Writeable;
    case 'readEncryptionRequired':
      return CBAttributePermission.ReadEncryptionRequired;
    case 'writeEncryptionRequired':
      return CBAttributePermission.WriteEncryptionRequired;
  }
}

export class Attribute {
  #uuid: string;

  constructor(uuid: string) {
    this.#uuid = uuid;
  }

  /**
   * The Bluetooth-specific UUID of the attribute.
   */
  get UUID(): string {
    return this.#uuid;
  }
}

/**
 * `Service` objects represent services of a remote peripheral. Services are either
 * primary or secondary and may contain multiple characteristics or included services
 * (references to other services).
 */
export class Service extends Attribute {
  #isPrimary: boolean;

  characteristics: Characteristic[] | null = null;

  constructor(uuid: string, isPrimary: boolean) {
    super(uuid);
    this.#isPrimary = isPrimary;
  }

  get isPrimary(): boolean {
    return this.#isPrimary;
  }
}

/**
 * A characteristic of a remote peripheral’s service.
 *
 * `Characteristic` represent further information about a peripheral’s service. In particular,
 * Characteristic objects represent the characteristics of a remote peripheral’s service.
 * A characteristic contains a single value and any number of descriptors describing that value.
 * The properties of a characteristic determine how you can use a characteristic’s value, and
 * how you access the descriptors.
 */
export class Characteristic extends Attribute {
  /**
   * This property contains the value of the characteristic. For example, a temperature measurement
   * characteristic of a health thermometer service may have a value that indicates
   * a temperature in Celsius.
   */
  value: Uint8Array | null;

  properties: CharacteristicProperty[];

  permissions: AttributePermission[];

  constructor(
    uuid: string,
    value: Uint8Array | null,
    options: {
      properties: CharacteristicProperty[];
      permissions: AttributePermission[];
    }
  ) {
    super(uuid);
    this.value = value;
    this.properties = options.properties;
    this.permissions = options.permissions;
  }
}
