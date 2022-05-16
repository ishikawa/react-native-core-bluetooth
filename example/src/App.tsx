import React, { useEffect, useState, useCallback } from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  multiply,
  CBUUIDCharacteristicUserDescriptionString,
  Constant1,
  Constant2,
  PeripheralManager,
} from 'react-native-core-bluetooth';

export default function App() {
  const [result, setResult] = useState<number | undefined>();

  useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  const onPress = useCallback(() => {
    alert(PeripheralManager);

    new PeripheralManager();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <Text>
        CBUUIDCharacteristicUserDescriptionString:{' '}
        {CBUUIDCharacteristicUserDescriptionString}
      </Text>
      <Text>Constant1: {Constant1}</Text>
      <Text>Constant2: {Constant2}</Text>
      <TouchableOpacity
        onPress={onPress}
        style={{
          marginTop: 6,
          backgroundColor: 'gray',
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}>
        <Text>Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
