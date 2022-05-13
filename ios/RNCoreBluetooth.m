#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (RNCoreBluetooth, NSObject)

RCT_EXTERN_METHOD(createPeripheralManager
                  : (BOOL)showPowerAlert restoreIdentifier
                  : (NSString *)restoreIdentifier)

RCT_EXTERN_METHOD(startAdvertising:)

RCT_EXTERN_METHOD(stopAdvertising)

RCT_EXTERN_METHOD(multiply
                  : (float)a withB
                  : (float)b withResolver
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject)

@end
