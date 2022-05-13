/**
 * CBPeripheralManager
 * https://developer.apple.com/documentation/corebluetooth/cbperipheralmanager
 *
 * An object that manages and advertises peripheral services exposed by this app.
 */
export class PeripheralManager {
  /**
   * Advertises peripheral manager data.
   */
  startAdvertising() {}

  stopAdvertising() {}

  /**
   * A Boolean value that indicates whether the peripheral is advertising data.
   *
   * This value is `true` if the peripheral is advertising data as a result of
   * successfully calling the `startAdvertising()` method. The value is `false`
   * if the peripheral is no longer advertising its data.
   */
  get isAdvertising(): boolean {
    return false;
  }
}
