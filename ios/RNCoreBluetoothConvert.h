#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCoreBluetoothConvert : NSObject

#pragma mark JS -> Native

+ (BOOL)jsToBoolValue:(id)value;
+ (NSData *)jsToData:(id)base64EncodedString;
+ (CBCharacteristicProperties)jsToCharacteristicProperties:(id)numArray;
+ (CBAttributePermissions)jsToAttributePermissions:(id)numArray;
+ (CBUUID *)jsToCBUUID:(id)uuidString;
+ (CBMutableCharacteristic *)jsToCharacteristic:(id)characteristicDict;
+ (CBMutableService *)jsToService:(id)serviceDict;

#pragma mark Native -> JS

+ (id)centralToJs:(CBCentral *)central;
+ (id)serviceToJs:(CBService *)service;
+ (id)characteristicToJs:(CBCharacteristic *)characteristic;
+ (id)requestToJs:(CBATTRequest *)request;
@end

NS_ASSUME_NONNULL_END
