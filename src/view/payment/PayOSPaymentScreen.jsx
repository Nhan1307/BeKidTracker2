import React from 'react';
import { WebView } from 'react-native-webview';

const PayOSPaymentScreen = ({ route, navigation }) => {
  const { checkoutUrl } = route.params;

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      style={{ flex: 1 }}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes('payment-success')) {
          navigation.replace('SuccessScreen');
        }
        if (navState.url.includes('payment-cancel')) {
          navigation.replace('FailScreen');
        }
      }}
      startInLoadingState
    />
  );
};

export default PayOSPaymentScreen; 