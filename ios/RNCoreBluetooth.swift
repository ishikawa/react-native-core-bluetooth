import Foundation
import CoreBluetooth

@objc(RNCoreBluetooth)
class RNCoreBluetooth: NSObject {

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b+10)
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
