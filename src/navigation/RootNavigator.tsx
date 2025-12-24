import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { UpdateProfileScreen } from '../screens/profile/UpdateProfileScreen';
import { ContractorListScreen } from '../screens/contractors/ContractorListScreen';
import { QuoteRequestScreen } from '../screens/quote/QuoteRequestScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.brand,
    border: colors.border,
    notification: colors.brand,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="ContractorList" component={ContractorListScreen} />
        <Stack.Screen name="QuoteRequest" component={QuoteRequestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
