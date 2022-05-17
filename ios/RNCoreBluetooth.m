#import "RNCoreBluetooth.h"
#import <CoreBluetooth/CoreBluetooth.h>

static NSString *const RNCoreBluetoothPeripheralManagerDidUpdateStateEvent =
    @"onPeripheralManagerDidUpdateState";

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

RCT_EXPORT_METHOD(peripheralManagerState
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject) {
  resolve([NSNumber numberWithInteger:[_peripheralManager state]]);
}

RCT_EXPORT_METHOD(startAdvertising
                  : (nonnull NSArray<NSString *> *)serviceUUIDs localName
                  : (nullable NSString *)localName) {
  NSMutableDictionary<NSString *, id> *advertisementData =
      [NSMutableDictionary dictionaryWithCapacity:2];

  // CBAdvertisementDataServiceUUIDsKey
  NSMutableArray *serviceCBUUIDs =
      [NSMutableArray arrayWithCapacity:[serviceUUIDs count]];

  [serviceUUIDs enumerateObjectsUsingBlock:^(NSString *uuidString,
                                             NSUInteger idx, BOOL *stop) {
    [serviceCBUUIDs addObject:[CBUUID UUIDWithString:uuidString]];
  }];

  advertisementData[CBAdvertisementDataServiceUUIDsKey] = serviceUUIDs;

  // CBAdvertisementDataLocalNameKey
  if (localName) {
    advertisementData[CBAdvertisementDataLocalNameKey] = localName;
  }

  [_peripheralManager startAdvertising:advertisementData];
}

RCT_EXPORT_METHOD(stopAdvertising) { [_peripheralManager stopAdvertising]; }

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
        RNCoreBluetoothPeripheralManagerDidUpdateStateEvent,
  };
}

#pragma mark EventEmitter

- (NSArray<NSString *> *)supportedEvents {
  return @[ RNCoreBluetoothPeripheralManagerDidUpdateStateEvent ];
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

/*
 * Required protocol method.
 *
 * A full app should take care of all the possible
 * states, but we're just waiting for to know when the CBPeripheralManager is
 * ready
 *
 * Starting from iOS 13.0, if the state is CBManagerStateUnauthorized, you
 * are also required to check for the authorization state of the peripheral to
 * ensure that your app is allowed to use bluetooth
 */
- (void)peripheralManagerDidUpdateState:
    (nonnull CBPeripheralManager *)peripheral {
  NSLog(@"peripheralManagerDidUpdateState: state = %ld, hasEventListeners = %d",
        (long)[peripheral state], _hasEventListeners);
  [self
      dispatchEventWithName:RNCoreBluetoothPeripheralManagerDidUpdateStateEvent
                       body:@{
                         @"state" :
                             [NSNumber numberWithInteger:[peripheral state]]
                       }];
}

@end
