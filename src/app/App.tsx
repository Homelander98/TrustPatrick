import React from 'react';
import { StatusBar, Text, TextInput, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from '../navigation/RootNavigator';
import { store } from '../store/store';
import { typography } from '../theme/typography';

(Text as any).defaultProps = (Text as any).defaultProps ?? {};
(Text as any).defaultProps.style = [
  { fontFamily: typography.fonts.regular },
  (Text as any).defaultProps.style,
].filter(Boolean);

(TextInput as any).defaultProps = (TextInput as any).defaultProps ?? {};
(TextInput as any).defaultProps.style = [
  { fontFamily: typography.fonts.regular },
  (TextInput as any).defaultProps.style,
].filter(Boolean);

export function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
