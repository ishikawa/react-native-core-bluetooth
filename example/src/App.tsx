import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { PeripheralManager } from 'react-native-core-bluetooth';
import type { ManagerState } from 'src/PeripheralManager';

const PERIPHERAL_SERVICE_UUID = 'E20A39F4-73F5-4BC4-A12F-17D1AD07A961';

export default function App() {
  const [manager] = useState(() => new PeripheralManager());
  const [bleState, setBleState] = useState<ManagerState | undefined>();
  const [isAdvertising, setIsAdvertising] = useState(false);

  // Subscribe state change
  useEffect(() => {
    console.debug('Subscribe BLE state change');
    const subscription = manager.onStateChange((state) => {
      console.info('state changed:', state);
      setBleState(state);
    });

    return function unsubscribe() {
      console.debug('Remove subscription...');
      subscription.remove();
    };
  }, [manager]);

  // Initialize BLE state in UI
  useEffect(() => {
    if (bleState === undefined) {
      manager.state().then((state) => setBleState(state));
    }
  }, [bleState, manager]);

  const onBleStatePress = useCallback(async () => {
    const state = await manager.state();
    Alert.alert('BLE state', `state = ${state}`);
  }, [manager]);

  const onIsAdvertisingPress = useCallback(async () => {
    const value = await manager.isAdvertising();
    Alert.alert('BLE isAdvertising', `value = ${value}`);
  }, [manager]);

  const onIsAdvertisingChange = useCallback(
    (switchOn: boolean) => {
      if (switchOn) {
        console.debug('startAdvertising =', PERIPHERAL_SERVICE_UUID);
        manager.startAdvertising([PERIPHERAL_SERVICE_UUID], {
          localName: 'example',
        });
      } else {
        console.debug('stopAdvertising =', PERIPHERAL_SERVICE_UUID);
        manager.stopAdvertising();
      }
      setIsAdvertising(switchOn);
    },
    [manager],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text>BLE state = {bleState}</Text>
      </View>
      <View style={[styles.row, { flexDirection: 'row' }]}>
        <Text style={{ lineHeight: 28, marginRight: 6 }}>Advertising</Text>
        <Switch value={isAdvertising} onValueChange={onIsAdvertisingChange} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={onBleStatePress} style={styles.button}>
          <Text>BLE state</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={onIsAdvertisingPress} style={styles.button}>
          <Text>isAdvertising</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    marginVertical: 6,
  },
  button: {
    backgroundColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 7,
  },
});
