import Foundation
import CoreBluetooth

@objc(RNCoreBluetooth)
class RNCoreBluetooth: NSObject, RCTBridgeModule {
  @objc
  static func moduleName() -> String! {
    "RNCoreBluetooth"
  }

  // If your module does not require access to UIKit, then you should respond to
  // + requiresMainQueueSetup with NO.
  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  // Export constants
  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "CBUUIDCharacteristicUserDescriptionString": CBUUIDCharacteristicUserDescriptionString,
      "Constant1": "1.2.3.4.5",
      "Constant2": 2022,
    ]
  }
}
