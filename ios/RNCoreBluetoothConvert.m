#import "RNCoreBluetoothConvert.h"
#import "RNCoreBluetoothUtils.h"

/**
 * Returns `nil` if the value is `nil` or an instance of `NSNull`.
 */
static inline id nullableJsValue(id value) {
  return value != nil && ![value isEqual:[NSNull null]] ? value : nil;
}

@implementation RNCoreBluetoothConvert

+ (nullable id)nullableJsValue:(id)value {
  return nullableJsValue(value);
}

#pragma mark JS -> Native

+ (CBCharacteristicProperties)jsToCharacteristicProperties:(id)numArray {
  ENSURE_NS_ARRAY(numArray, @"properties");

  CBCharacteristicProperties p = 0;

  for (NSNumber *n in numArray) {
    p |= n.unsignedIntegerValue;
  }

  return p;
}

+ (CBAttributePermissions)jsToAttributePermissions:(id)numArray {
  ENSURE_NS_ARRAY(numArray, @"permissions");

  CBAttributePermissions p = 0;

  for (NSNumber *n in numArray) {
    p |= n.unsignedIntegerValue;
  }

  return p;
}

+ (CBUUID *)jsToCBUUID:(id)uuid {
  ENSURE_NS_STRING(uuid, @"uuid");
  return [CBUUID UUIDWithString:uuid];
}

+ (NSData *)jsToData:(id)base64EncodedString {
  ENSURE_NS_STRING(base64EncodedString, @"value");
  return [[NSData alloc] initWithBase64EncodedString:base64EncodedString
                                             options:0];
}

+ (BOOL)jsToBoolValue:(id)value {
  ENSURE_NS_NUMBER(value, @"value");
  return [value boolValue];
}

+ (CBMutableCharacteristic *)jsToCharacteristic:(id)characteristicDict {
  CBUUID *uuid = [self jsToCBUUID:characteristicDict[@"uuid"]];
  id v = nullableJsValue(characteristicDict[@"value"]);
  NSData *value = (v != nil) ? [self jsToData:v] : nil;
  const CBCharacteristicProperties properties =
      [self jsToCharacteristicProperties:characteristicDict[@"properties"]];
  const CBAttributePermissions permissions =
      [self jsToAttributePermissions:characteristicDict[@"permissions"]];

  return [[CBMutableCharacteristic alloc] initWithType:uuid
                                            properties:properties
                                                 value:value
                                           permissions:permissions];
}

+ (CBMutableService *)jsToService:(id)serviceDict {
  CBUUID *uuid = [self jsToCBUUID:serviceDict[@"uuid"]];
  const BOOL isPrimary = [self jsToBoolValue:serviceDict[@"isPrimary"]];

  NSArray *characteristicDicts = serviceDict[@"characteristics"];
  NSMutableArray *characteristics =
      [NSMutableArray arrayWithCapacity:characteristicDicts.count];

  for (NSDictionary *characteristicDict in characteristicDicts) {
    [characteristics addObject:[self jsToCharacteristic:characteristicDict]];
  }

  CBMutableService *service = [[CBMutableService alloc] initWithType:uuid
                                                             primary:isPrimary];

  service.characteristics = characteristics;
  return service;
}

#pragma mark Native -> JS
+ (id)dataToJs:(NSData *)data {
  return [data base64EncodedStringWithOptions:0];
}

+ (id)centralToJs:(nonnull CBCentral *)central {
  return @{
    @"identifier" : central.identifier.UUIDString,
    @"maximumUpdateValueLength" : @(central.maximumUpdateValueLength)
  };
}

+ (id)serviceToJs:(nonnull CBService *)service {
  return @{
    @"UUID" : service.UUID.UUIDString,
    @"isPrimary" : @(service.isPrimary),
  };
}

+ (id)characteristicToJs:(nonnull CBCharacteristic *)characteristic {
  return @{
    @"UUID" : characteristic.UUID.UUIDString,
    @"value" : characteristic.value ? [self dataToJs:characteristic.value]
                                    : [NSNull null],
    @"serviceUUID" : characteristic.service.UUID.UUIDString,
  };
}

+ (id)requestToJs:(nonnull CBATTRequest *)request {
  return @{
    @"centralUUID" : request.central.identifier.UUIDString,
    @"serviceId" : request.characteristic.service.UUID.UUIDString,
    @"characteristicId" : request.characteristic.UUID.UUIDString,
    @"value" : request.value ? [self dataToJs:request.value] : [NSNull null],
    @"offset" : @(request.offset),
  };
}

+ (id)errorToJs:(nonnull NSError *)error {
  return @{
    @"code" : @(error.code),
    @"domain" : error.domain,
    @"description" : error.localizedDescription,
  };
}
@end
