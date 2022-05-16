import Foundation
import CoreBluetooth

let PeripheralManagerDidUpdateStateEvent = "onPeripheralManagerDidUpdateState"

@objc(RNCoreBluetooth)
class RNCoreBluetooth: RCTEventEmitter {

  private var peripheralManager: CBPeripheralManager!
  private var hasEventListeners = false

  @objc
  override func startObserving() {
    self.hasEventListeners = true
  }

  @objc
  override func stopObserving() {
    self.hasEventListeners = false
  }

  @objc
  override func supportedEvents() -> [String] {
    return [PeripheralManagerDidUpdateStateEvent]
  }

  @objc(createPeripheralManager:restoreIdentifier:)
  func createPeripheralManager(showPowerAlert: Bool, restoreIdentifier: String?) {
    var options = [String : Any]()

    options[CBPeripheralManagerOptionShowPowerAlertKey] = showPowerAlert
    
    if let restoreIdentifier = restoreIdentifier {
      options[CBPeripheralManagerOptionRestoreIdentifierKey] = restoreIdentifier
    }

    peripheralManager = CBPeripheralManager(delegate: self, queue: nil, options: options)
  }
  
  @objc(startAdvertising:localName:)
  func startAdvertising(serviceUUIDs: [String], localName: String?) {
    var advertisementData = [String : Any]()
    let serviceUUIDs = serviceUUIDs.map({(uuid: String) -> CBUUID in CBUUID(string: uuid) })

    advertisementData[CBAdvertisementDataServiceUUIDsKey] = serviceUUIDs
    if let localName = localName {
      advertisementData[CBAdvertisementDataLocalNameKey] = localName
    }

    peripheralManager.startAdvertising(advertisementData)
  }
  
  @objc
  func stopAdvertising() {
    peripheralManager.stopAdvertising()
  }
  
  @objc(peripheralManagerState:withRejecter:)
  func peripheralManagerState(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve(peripheralManager.state.rawValue)
  }
  
  @objc
  override static func moduleName() -> String! {
    "RNCoreBluetooth"
  }

  // If your module does not require access to UIKit, then you should respond to
  // + requiresMainQueueSetup with NO.
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  // Export constants
  @objc
  override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "CBUUIDCharacteristicUserDescriptionString": CBUUIDCharacteristicUserDescriptionString,
      "Constant1": "1.2.3.4.5",
      "Constant2": 2022,
      // Event names
      "PeripheralManagerDidUpdateStateEvent": PeripheralManagerDidUpdateStateEvent,
    ]
  }

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }
}

extension RNCoreBluetooth: CBPeripheralManagerDelegate {
    // implementations of the CBPeripheralManagerDelegate methods

    /*
     *  Required protocol method.  A full app should take care of all the possible states,
     *  but we're just waiting for to know when the CBPeripheralManager is ready
     *
     *  Starting from iOS 13.0, if the state is CBManagerStateUnauthorized, you
     *  are also required to check for the authorization state of the peripheral to ensure that
     *  your app is allowed to use bluetooth
     */
    internal func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
      self.sendEvent(withName: PeripheralManagerDidUpdateStateEvent, body: [
        "state": peripheral.state
      ])
    }
}
