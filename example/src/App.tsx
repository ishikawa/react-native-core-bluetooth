import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  PeripheralManager,
  Characteristic,
  ManagerState,
  Service,
  Central,
} from 'react-native-core-bluetooth';

const PERIPHERAL_SERVICE_UUID = 'E20A39F4-73F5-4BC4-A12F-17D1AD07A961';
const PERIPHERAL_CHARACTERISTIC_UUID = '08590F7E-DB05-467E-8757-72F6FAEB13D4';

function setUpService(manager: PeripheralManager) {
  // Build our service.
  console.debug('Build our service.');

  // Start with the CBMutableCharacteristic.
  const transferCharacteristic = new Characteristic(
    PERIPHERAL_CHARACTERISTIC_UUID,
    null,
    {
      properties: ['notify', 'writeWithoutResponse'],
      permissions: ['readable', 'writeable'],
    },
  );
  const transferService = new Service(PERIPHERAL_SERVICE_UUID, true);

  transferService.characteristics = [transferCharacteristic];

  manager.addService(transferService);
}

export default function App() {
  const [manager] = useState(() => new PeripheralManager());
  const [bleState, setBleState] = useState<ManagerState | undefined>();
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [subscribers, setSubscribers] = useState<Central[]>([]);

  // Subscribe state change
  useEffect(() => {
    console.debug('Subscribe BLE state change');
    const subscription1 = manager.onStateChange((state) => {
      console.info('state changed:', state);
      setBleState(state);
    });
    const subscription2 = manager.onSubscribeToCharacteristic(
      (central, serviceUUID, characteristicUUID) => {
        console.info(
          central.identifier,
          'subscribed to characteristic',
          characteristicUUID,
          'for service',
          serviceUUID,
        );

        setSubscribers((prevSubscribers) => [...prevSubscribers, central]);
      },
    );
    const subscription3 = manager.onUnsubscribeFromCharacteristic(
      (central, serviceUUID, characteristicUUID) => {
        console.info(
          central.identifier,
          'unsubscribed from characteristic',
          characteristicUUID,
          'for service',
          serviceUUID,
        );

        setSubscribers((prevSubscribers) =>
          prevSubscribers.filter((c) => c.identifier !== central.identifier),
        );
      },
    );

    return function unsubscribe() {
      console.debug('Remove subscription...');
      subscription1.remove();
      subscription2.remove();
      subscription3.remove();
    };
  }, [manager]);

  // Initialize BLE state in UI
  useEffect(() => {
    if (bleState === undefined) {
      manager.state().then((state) => setBleState(state));
    }
  }, [bleState, manager]);

  // Set up peripheral
  useEffect(() => {
    if (bleState === 'PoweredOn') {
      setUpService(manager);
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
      <View style={styles.row}>
        <Text style={{ fontWeight: 'bold' }}>Connected subscribers</Text>
        {subscribers.map((central) => (
          <Text key={central.identifier}>
            {central.identifier} ({central.maximumUpdateValueLength})
          </Text>
        ))}
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
