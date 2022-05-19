#import "RNCoreBluetooth.h"
#import "RNCoreBluetoothConvert.h"
#import "RNCoreBluetoothUtils.h"
#import <CoreBluetooth/CoreBluetooth.h>

#pragma mark Event names

static NSString *const RNCoreBluetoothPeripheralManagerDidUpdateState =
    @"onPeripheralManagerDidUpdateState";

static NSString
    *const RNCoreBluetoothPeripheralManagerCentralDidSubscribeToCharacteristic =
        @"onPeripheralManagerCentralDidSubscribeToCharacteristic";

static NSString *const
    RNCoreBluetoothPeripheralManagerCentralDidUnsubscribeFromCharacteristic =
        @"onPeripheralManagerCentralDidUnsubscribeFromCharacteristic";

static NSString
    *const RNCoreBluetoothPeripheralManagerIsReadyToUpdateSubscribers =
        @"onPeripheralManagerIsReadyToUpdateSubscribers";

static NSString *const RNCoreBluetoothPeripheralManagerDidReceiveReadRequest =
    @"onPeripheralManagerDidReceiveReadRequest";

static NSString *const RNCoreBluetoothPeripheralManagerDidReceiveWriteRequests =
    @"onPeripheralManagerDidReceiveWriteRequests";

@interface RNCoreBluetooth (CBPeripheralManagerDelegate) <
    CBPeripheralManagerDelegate>
@end

@implementation RNCoreBluetooth {
  BOOL _hasEventListeners;
  CBPeripheralManager *_peripheralManager;
}

// RN bridge will populate it
@synthesize methodQueue = _methodQueue;

RCT_EXPORT_MODULE(CoreBluetooth);

RCT_EXPORT_METHOD(createPeripheralManager
                  : (BOOL)runInMainQueue showPowerAlert
                  : (BOOL)showPowerAlert restoreIdentifier
                  : (nullable NSString *)restoreIdentifier) {
  const dispatch_queue_t queue = runInMainQueue ? nil : self.methodQueue;
  NSMutableDictionary<NSString *, id> *options =
      [NSMutableDictionary dictionaryWithCapacity:2];

  if (showPowerAlert) {
    options[CBPeripheralManagerOptionShowPowerAlertKey] = @TRUE;
  }
  if (restoreIdentifier) {
    options[CBPeripheralManagerOptionRestoreIdentifierKey] = restoreIdentifier;
  }

  _peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self
                                                               queue:queue
                                                             options:options];
}

RCT_EXPORT_METHOD(state
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject) {
  resolve(@(_peripheralManager.state));
}

RCT_EXPORT_METHOD(isAdvertising
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject) {
  resolve(@(_peripheralManager.isAdvertising));
}

RCT_EXPORT_METHOD(startAdvertising
                  : (nonnull NSArray<NSString *> *)serviceUUIDs localName
                  : (nullable NSString *)localName) {
  NSMutableDictionary<NSString *, id> *advertisementData =
      [NSMutableDictionary dictionaryWithCapacity:2];

  // CBAdvertisementDataServiceUUIDsKey
  NSMutableArray *serviceCBUUIDs =
      [NSMutableArray arrayWithCapacity:serviceUUIDs.count];

  [serviceUUIDs enumerateObjectsUsingBlock:^(NSString *uuidString,
                                             NSUInteger _idx, BOOL *_stop) {
    [serviceCBUUIDs addObject:[CBUUID UUIDWithString:uuidString]];
  }];

  advertisementData[CBAdvertisementDataServiceUUIDsKey] = serviceCBUUIDs;

  // CBAdvertisementDataLocalNameKey
  if (localName) {
    advertisementData[CBAdvertisementDataLocalNameKey] = localName;
  }

  [_peripheralManager startAdvertising:advertisementData];
}

RCT_EXPORT_METHOD(stopAdvertising) { [_peripheralManager stopAdvertising]; }

RCT_EXPORT_METHOD(addService
                  : (nonnull NSDictionary<NSString *, id> *)serviceDict) {
  NSLog(@"addService:%@", serviceDict);

  CBMutableService *service = [RNCoreBluetoothConvert jsToService:serviceDict];

  [_peripheralManager addService:service];
}

#pragma mark React Native

/**
 * Most modules can be used from any thread. All of the modules exported
 * non-sync method will be called on its methodQueue, and the module will be
 * constructed lazily when its first invoked. Some modules have main need to
 * access information that's main queue only (e.g. most UIKit classes). Since we
 * don't want to dispatch synchronously to the main thread to this safely, we
 * construct these modules and export their constants ahead-of-time.
 *
 * Note that when set to false, the module constructor will be called from any
 * thread.
 *
 * This requirement is currently inferred by checking if the module has a custom
 * initializer or if there's exported constants. In the future, we'll stop
 * automatically inferring this and instead only rely on this method.
 */
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

/**
 * Injects constants into JS. These constants are made accessible via
 * NativeModules.ModuleName.X. It is only called once for the lifetime of the
 * bridge, so it is not suitable for returning dynamic values, but may be used
 * for long-lived values such as session keys, that are regenerated only as part
 * of a reload of the entire React application.
 *
 * If you implement this method and do not implement `requiresMainQueueSetup`,
 * you will trigger deprecated logic that eagerly initializes your module on
 * bridge startup. In the future, this behaviour will be changed to default to
 * initializing lazily, and even modules with constants will be initialized
 * lazily.
 */
- (NSDictionary *)constantsToExport {
  return @{
    @"PeripheralManagerDidUpdateStateEvent" :
        RNCoreBluetoothPeripheralManagerDidUpdateState,
    @"PeripheralManagerCentralDidSubscribeToCharacteristic" :
        RNCoreBluetoothPeripheralManagerCentralDidSubscribeToCharacteristic,
    @"PeripheralManagerCentralDidUnsubscribeFromCharacteristic" :
        RNCoreBluetoothPeripheralManagerCentralDidUnsubscribeFromCharacteristic,
    @"PeripheralManagerIsReadyToUpdateSubscribers" :
        RNCoreBluetoothPeripheralManagerIsReadyToUpdateSubscribers,
    @"PeripheralManagerDidReceiveReadRequest" :
        RNCoreBluetoothPeripheralManagerDidReceiveReadRequest,
    @"PeripheralManagerDidReceiveWriteRequests" :
        RNCoreBluetoothPeripheralManagerDidReceiveWriteRequests
  };
}

#pragma mark EventEmitter

- (NSArray<NSString *> *)supportedEvents {
  return @[
    RNCoreBluetoothPeripheralManagerDidUpdateState,
    RNCoreBluetoothPeripheralManagerCentralDidSubscribeToCharacteristic,
    RNCoreBluetoothPeripheralManagerCentralDidUnsubscribeFromCharacteristic,
    RNCoreBluetoothPeripheralManagerIsReadyToUpdateSubscribers,
    RNCoreBluetoothPeripheralManagerDidReceiveReadRequest,
    RNCoreBluetoothPeripheralManagerDidReceiveWriteRequests,
  ];
}

- (void)dispatchEventWithName:(nonnull NSString *)name body:(nonnull id)body {
  if (_hasEventListeners) {
    [self sendEventWithName:name body:body];
  }
}

- (void)startObserving {
  _hasEventListeners = YES;
}

- (void)stopObserving {
  _hasEventListeners = NO;
}

@end

@implementation RNCoreBluetooth (CBPeripheralManagerDelegate)

// Required protocol method.
//
// A full app should take care of all the possible
// states, but we're just waiting for to know when the CBPeripheralManager is
// ready
//
// Starting from iOS 13.0, if the state is CBManagerStateUnauthorized, you
// are also required to check for the authorization state of the peripheral to
// ensure that your app is allowed to use bluetooth
- (void)peripheralManagerDidUpdateState:
    (nonnull CBPeripheralManager *)peripheral {
  NSLog(@"peripheralManagerDidUpdateState: state = %ld, hasEventListeners = %d",
        (long)peripheral.state, _hasEventListeners);
  [self dispatchEventWithName:RNCoreBluetoothPeripheralManagerDidUpdateState
                         body:@{@"state" : @(peripheral.state)}];
}

// Tells the delegate that a remote central device subscribed to a
// characteristic’s value.
- (void)peripheralManager:(CBPeripheralManager *)peripheral
                         central:(CBCentral *)central
    didSubscribeToCharacteristic:(CBCharacteristic *)characteristic {
  NSLog(@"peripheralManager:central:didSubscribeToCharacteristic: central = "
        @"%@, characteristic = %@",
        central.identifier.UUIDString, characteristic.UUID.UUIDString);
  [self
      dispatchEventWithName:
          RNCoreBluetoothPeripheralManagerCentralDidSubscribeToCharacteristic
                       body:@{
                         @"central" : [RNCoreBluetoothConvert centralToJs:central],
                         @"characteristic" : [RNCoreBluetoothConvert
                             characteristicToJs:characteristic]
                       }];
}

// Tells the delegate that a remote central device unsubscribed from a
// characteristic’s value.
- (void)peripheralManager:(CBPeripheralManager *)peripheral
                             central:(CBCentral *)central
    didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
  NSLog(
      @"peripheralManager:central:didUnsubscribeFromCharacteristic: central = "
      @"%@, characteristic = %@",
      central.identifier.UUIDString, characteristic.UUID.UUIDString);
  [self
      dispatchEventWithName:
          RNCoreBluetoothPeripheralManagerCentralDidSubscribeToCharacteristic
                       body:@{
                         @"central" : [RNCoreBluetoothConvert centralToJs:central],
                         @"characteristic" : [RNCoreBluetoothConvert
                             characteristicToJs:characteristic]
                       }];
}

// This callback comes in when the PeripheralManager is ready to send the next
// chunk of data. This is to ensure that packets will arrive in the order they
// are sent
- (void)peripheralManagerIsReadyToUpdateSubscribers:
    (CBPeripheralManager *)peripheral {
  NSLog(@"peripheralManagerIsReadyToUpdateSubscribers:");
  [self dispatchEventWithName:
            RNCoreBluetoothPeripheralManagerIsReadyToUpdateSubscribers
                         body:@{}];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveReadRequest:(CBATTRequest *)request {
  NSLog(@"peripheralManager:didReceiveReadRequest:");
  [self dispatchEventWithName:
            RNCoreBluetoothPeripheralManagerDidReceiveReadRequest
                         body:@{
                           @"request" : [RNCoreBluetoothConvert requestToJs:request]
                         }];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
  NSMutableArray *jsonRequests =
      [NSMutableArray arrayWithCapacity:requests.count];

  [requests enumerateObjectsUsingBlock:^(CBATTRequest *request, NSUInteger _idx,
                                         BOOL *_stop) {
    [jsonRequests addObject:[RNCoreBluetoothConvert requestToJs:request]];
  }];

  NSLog(@"peripheralManager:didReceiveWriteRequests: (%lu req)",
        (unsigned long)requests.count);
  [self dispatchEventWithName:
            RNCoreBluetoothPeripheralManagerDidReceiveReadRequest
                         body:@{@"requests" : jsonRequests}];
}

@end
