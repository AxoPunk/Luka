import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from './theme';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://copilotstudio.microsoft.com/environments/Default-84c31ca0-ac3b-4eae-ad11-519d80233e6f/bots/cr5be_lukaIa/webchat?__version__=2' }}
        style={styles.webview}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit={false} // Bloquea zoom en Android
        useWebKit={true} // Para iOS
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        injectedJavaScript={`
          const meta = document.createElement('meta');
          meta.setAttribute('name', 'viewport');
          meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
          document.getElementsByTagName('head')[0].appendChild(meta);
          document.body.style.overflow = 'hidden';
          document.body.style.touchAction = 'manipulation';
          document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
          document.addEventListener('gesturechange', function (e) { e.preventDefault(); });
          document.addEventListener('gestureend', function (e) { e.preventDefault(); });
        `}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 0,
    // Si quieres bordes redondeados, puedes usar borderRadius: 16,
  },
});
