import React, { useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { PeripheralManager } from 'react-native-core-bluetooth';

export default function App() {
  const peripheralManagerRef = useRef<PeripheralManager | undefined>();

  useEffect(() => {
    if (!peripheralManagerRef.current) {
      peripheralManagerRef.current = new PeripheralManager();
    }
  }, []);

  const onPress = useCallback(async () => {
    if (peripheralManagerRef.current) {
      const state = await peripheralManagerRef.current.state();
      Alert.alert('BLE state', `state = ${state}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          marginTop: 6,
          backgroundColor: 'gray',
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}>
        <Text>BLE state</Text>
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
