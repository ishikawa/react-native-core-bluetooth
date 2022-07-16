#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCoreBluetoothConvert : NSObject

/**
 * Returns `nil` if the value is `nil` or an instance of `NSNull`.
 */
+ (nullable id)nullableJsValue:(id)value;

#pragma mark JS -> Native

+ (BOOL)jsToBoolValue:(id)value;
+ (NSData *)jsToData:(id)base64EncodedString;
+ (CBCharacteristicProperties)jsToCharacteristicProperties:(id)numArray;
+ (CBAttributePermissions)jsToAttributePermissions:(id)numArray;
+ (CBUUID *)jsToCBUUID:(id)uuidString;
+ (CBMutableCharacteristic *)jsToCharacteristic:(id)characteristicDict;
+ (CBMutableService *)jsToService:(id)serviceDict;

#pragma mark Native -> JS

+ (id)dataToJs:(NSData *)data;
+ (id)centralToJs:(CBCentral *)central;
+ (id)serviceToJs:(CBService *)service;
+ (id)characteristicToJs:(CBCharacteristic *)characteristic;
+ (id)requestToJs:(CBATTRequest *)request;
+ (id)errorToJs:(nonnull NSError *)error;
@end

NS_ASSUME_NONNULL_END
