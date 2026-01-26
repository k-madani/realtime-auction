import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  connect(onConnect, onError) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        if (onConnect) onConnect();
      },
      
      onStompError: (frame) => {
        console.error('❌ WebSocket Error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      
      onWebSocketError: (error) => {
        console.error('❌ WebSocket Connection Error:', error);
        this.connected = false;
        if (onError) onError(error);
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      console.log('🔌 Disconnecting WebSocket...');
      Object.keys(this.subscriptions).forEach(key => {
        this.unsubscribe(key);
      });
      this.client.deactivate();
      this.connected = false;
      console.log('✅ WebSocket Disconnected');
    }
  }

  subscribeToAuction(auctionId, callback) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/auction/${auctionId}`;
    const subscriptionKey = `auction_${auctionId}`;

    // Unsubscribe if already subscribed
    if (this.subscriptions[subscriptionKey]) {
      this.unsubscribe(subscriptionKey);
    }

    console.log(`📡 Subscribing to ${destination}`);

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log(`📨 Received bid notification for auction ${auctionId}:`, data);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions[subscriptionKey] = subscription;
    return subscription;
  }

  subscribeToAuctionStatus(auctionId, callback) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/auction/${auctionId}/status`;
    const subscriptionKey = `status_${auctionId}`;

    if (this.subscriptions[subscriptionKey]) {
      this.unsubscribe(subscriptionKey);
    }

    console.log(`📡 Subscribing to ${destination}`);

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log(`📨 Received status notification for auction ${auctionId}:`, data);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions[subscriptionKey] = subscription;
    return subscription;
  }

  unsubscribe(subscriptionKey) {
    if (this.subscriptions[subscriptionKey]) {
      console.log(`🔕 Unsubscribing from ${subscriptionKey}`);
      this.subscriptions[subscriptionKey].unsubscribe();
      delete this.subscriptions[subscriptionKey];
    }
  }

  unsubscribeFromAuction(auctionId) {
    this.unsubscribe(`auction_${auctionId}`);
    this.unsubscribe(`status_${auctionId}`);
  }

  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;