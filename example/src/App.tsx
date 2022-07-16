import React, { useEffect, useCallback, useState, useRef } from 'react';
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

// @ts-ignore
// eslint-disable-next-line no-undef
const utf8encoder = new TextEncoder();

const PERIPHERAL_SERVICE_UUID = 'E20A39F4-73F5-4BC4-A12F-17D1AD07A961';
const PERIPHERAL_CHARACTERISTIC_UUID = '08590F7E-DB05-467E-8757-72F6FAEB13D4';

const STRING_TO_SEND =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const EOM = utf8encoder.encode('EOM');

class ConnectedCentral {
  #manager: PeripheralManager;

  #central: Central;

  #characteristicUUID: string;

  #dataToSend: Uint8Array;

  #sendDataIndex = 0;

  #sendingEOM = false;

  constructor(
    manager: PeripheralManager,
    central: Central,
    characteristicUUID: string,
    dataToSend: Uint8Array,
  ) {
    this.#manager = manager;
    this.#central = central;
    this.#characteristicUUID = characteristicUUID;
    this.#dataToSend = dataToSend;
  }

  get central(): Central {
    return this.#central;
  }

  get characteristicUUID(): string {
    return this.#characteristicUUID;
  }

  /**
   *  Sends the next amount of data to the connected central
   */
  async sendData() {
    // First up, check if we're meant to be sending an EOM
    if (this.#sendingEOM) {
      const didSend = await this.#manager.updateValue(
        EOM,
        this.#characteristicUUID,
        [this.#central.identifier],
      );
      if (didSend) {
        console.info('Sent: EOM for', this.#central.identifier);
      }
      // It didn't send, so we'll exit and wait for peripheralManagerIsReadyToUpdateSubscribers to call sendData again
      return;
    }

    // We're not sending an EOM, so we're sending data
    // Is there any left to send?
    if (this.#sendDataIndex >= this.#dataToSend.byteLength) {
      // No data left.  Do nothing
      return;
    }

    // There's data left, so send until the callback fails, or we're done.
    let didSend = true;
    const mtu = this.#central.maximumUpdateValueLength;

    while (didSend) {
      // Work out how big it should be
      const amountToSend = Math.min(
        this.#dataToSend.byteLength - this.#sendDataIndex,
        mtu,
      );

      // Copy out the data we want
      let chunk = this.#dataToSend.subarray(
        this.#sendDataIndex,
        this.#sendDataIndex + amountToSend,
      );

      // Send it
      didSend = await this.#manager.updateValue(
        chunk,
        this.#characteristicUUID,
        [this.#central.identifier],
      );

      // If it didn't work, drop out and wait for the callback
      if (!didSend) {
        return;
      }

      console.debug(
        'Sent',
        chunk.byteLength,
        'bytes for',
        this.#central.identifier,
      );

      // It did send, so update our index
      this.#sendDataIndex += amountToSend;

      // Was it the last one?
      if (this.#sendDataIndex >= this.#dataToSend.byteLength) {
        // It was - send an EOM

        // Set this so if the send fails, we'll send it next time
        this.#sendingEOM = true;

        //Send it
        const eomSent = await this.#manager.updateValue(
          EOM,
          this.#characteristicUUID,
          [this.#central.identifier],
        );

        if (eomSent) {
          // It sent; we're all done
          this.#sendingEOM = false;
          console.debug('Sent: EOM');
        }
        return;
      }
    }
  }
}

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

  const [, setUpdate] = useState(0);
  const subscribersRef = useRef<ConnectedCentral[]>([]);

  const rerender = useCallback(() => {
    setUpdate((n) => n + 1);
  }, []);

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

        const dataToSend = utf8encoder.encode(STRING_TO_SEND);
        const connectedCentral = new ConnectedCentral(
          manager,
          central,
          characteristicUUID,
          dataToSend,
        );

        connectedCentral.sendData();
        subscribersRef.current.push(connectedCentral);
        rerender();
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

        subscribersRef.current = subscribersRef.current.filter(
          (c) => c.central.identifier !== central.identifier,
        );
        rerender();
      },
    );
    const subscription4 = manager.onReadyToUpdateSubscribers(() => {
      // Start sending again
      for (const c of subscribersRef.current) {
        c.sendData();
      }
    });
    const subscription5 = manager.onStartAdvertising((error) => {
      console.info('Start advertising: error =', error);
    });

    return function unsubscribe() {
      console.debug('Remove subscription...');
      subscription1.remove();
      subscription2.remove();
      subscription3.remove();
      subscription4.remove();
      subscription5.remove();
    };
  }, [manager, rerender]);

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
        {subscribersRef.current.map((c) => (
          <Text key={c.central.identifier}>
            {c.central.identifier} ({c.central.maximumUpdateValueLength})
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
