//
//  BluetoothEventEmitter.m
//  RNCoreBluetooth
//
//  Created by 石川尊教 on 2022/05/16.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "RNCoreBluetoothEventEmitter.h"
#import <React/RCTLog.h>

@implementation RNCoreBluetoothEventEmitter

RCT_EXPORT_MODULE(CoreBluetoothEventEmitter);

RCT_EXPORT_METHOD(fireEvent:(id)body)
{
  RCTLogInfo(@"Pretending to create an event with %@", body);
  [self sendEventWithName:@"MyEvent" body:body];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"MyEvent"];
}

@end
