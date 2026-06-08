import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import FeedScreen from '../screens/FeedScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: Colors.surface,
  borderTopColor: Colors.border,
  borderTopWidth: 1,
  height: Platform.OS === 'ios' ? 84 : 60,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
  elevation: 0,
  shadowOpacity: 0,
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accentBlue,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: '信号',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="bar-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: '自选',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="watchlist" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple geometric icon using React Native Views — zero native deps
import { View, Text, StyleSheet } from 'react-native';

function TabBarIcon({
  name,
  focused,
  color,
}: {
  name: 'bar-chart' | 'watchlist' | 'person';
  focused: boolean;
  color: string;
}) {
  if (name === 'watchlist') {
    // Star ★ in accent-gold
    return (
      <Text style={{ fontSize: 20, color: focused ? Colors.accentGold : color, lineHeight: 22 }}>
        ★
      </Text>
    );
  }
  if (name === 'bar-chart') {
    return (
      <View style={iconStyles.row}>
        <View style={[iconStyles.bar, { height: 8, backgroundColor: color }]} />
        <View style={[iconStyles.bar, { height: 14, backgroundColor: color }]} />
        <View style={[iconStyles.bar, { height: 10, backgroundColor: color }]} />
        <View style={[iconStyles.bar, { height: 18, backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={iconStyles.personWrap}>
      <View style={[iconStyles.head, { borderColor: color }]} />
      <View style={[iconStyles.body, { borderColor: color }]} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 20,
  },
  bar: {
    width: 4,
    borderRadius: 1,
  },
  personWrap: {
    alignItems: 'center',
    height: 22,
    gap: 1,
  },
  head: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  body: {
    width: 14,
    height: 9,
    borderRadius: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
});
