
// Web Bluetooth API service for real-time Bluetooth functionality
export class BluetoothService {
  private connectedDevice: BluetoothDevice | null = null;
  private gattServer: BluetoothRemoteGATTServer | null = null;
  private transferCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  // UUIDs for our custom GATT service and characteristic
  private readonly SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Use Battery Service UUID for testing
  private readonly CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level characteristic

  // Check if Bluetooth is available in the browser
  isBluetoothAvailable(): boolean {
    return 'bluetooth' in navigator;
  }
  
  // Request Bluetooth device with specific services
  async requestDevice(): Promise<BluetoothDevice | null> {
    if (!this.isBluetoothAvailable()) {
      console.error('Web Bluetooth API not available');
      return null;
    }
    
    try {
      // Request device with our service
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });
      
      console.log('Bluetooth device selected:', device.name);
      this.connectedDevice = device;
      
      // Set up disconnection listener
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth device disconnected');
        this.gattServer = null;
        this.transferCharacteristic = null;
      });
      
      return device;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return null;
    }
  }
  
  // Connect to the GATT server of the device
  async connect(): Promise<boolean> {
    if (!this.connectedDevice) {
      console.error('No Bluetooth device selected');
      return false;
    }
    
    try {
      this.gattServer = await this.connectedDevice.gatt?.connect();
      if (!this.gattServer) {
        console.error('Failed to connect to GATT server');
        return false;
      }
      
      // Get the transfer service
      const service = await this.gattServer.getPrimaryService(this.SERVICE_UUID);
      
      // Get the transfer characteristic
      this.transferCharacteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
      
      console.log('Connected to GATT server and got characteristic');
      return true;
    } catch (error) {
      console.error('Error connecting to GATT server:', error);
      return false;
    }
  }
  
  // Disconnect from the device
  disconnect(): void {
    if (this.gattServer && this.gattServer.connected) {
      this.gattServer.disconnect();
    }
    
    this.gattServer = null;
    this.transferCharacteristic = null;
  }
  
  // Send data to connected device
  async sendData(data: any): Promise<boolean> {
    if (!this.transferCharacteristic) {
      console.error('No characteristic available for sending data');
      return false;
    }
    
    try {
      // Convert data to JSON string and then to bytes
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(jsonString);
      
      // Write the data
      await this.transferCharacteristic.writeValue(dataBytes);
      console.log('Data sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending data:', error);
      return false;
    }
  }
  
  // Get available devices (This is a mock since Web Bluetooth doesn't allow scanning without user gesture)
  // In a real implementation, we would use the requestDevice method which prompts the user to select a device
  getAvailableDevices(): Promise<{id: string, name: string}[]> {
    return new Promise((resolve) => {
      // We can't actually scan for devices without user interaction in Web Bluetooth
      // This would be handled by the requestDevice method instead
      resolve([]);
    });
  }
  
  // Get the currently connected device
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }
}

export default new BluetoothService();
