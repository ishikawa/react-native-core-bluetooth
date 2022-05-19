#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark Type check

#define ENSURE_NS_STRING(var, varName)                                         \
  if (![(var) isKindOfClass:[NSString class]]) {                               \
    @throw [NSException exceptionWithName:NSInvalidArgumentException           \
                                   reason:varName @" must be string"           \
                                 userInfo:nil];                                \
  }
#define ENSURE_NS_NUMBER(var, varName)                                         \
  if (![(var) isKindOfClass:[NSNumber class]]) {                               \
    @throw [NSException exceptionWithName:NSInvalidArgumentException           \
                                   reason:varName @" must be number"           \
                                 userInfo:nil];                                \
  }
#define ENSURE_NS_ARRAY(var, varName)                                          \
  if (![(var) isKindOfClass:[NSArray class]]) {                                \
    @throw [NSException exceptionWithName:NSInvalidArgumentException           \
                                   reason:varName @" must be array"            \
                                 userInfo:nil];                                \
  }

NS_ASSUME_NONNULL_END
