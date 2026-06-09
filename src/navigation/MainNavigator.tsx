import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, Text, StyleSheet } from 'react-native';
import FeedScreen from '../screens/FeedScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import AddCompanyScreen from '../screens/AddCompanyScreen';
import MatrixScreen from '../screens/MatrixScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SimulationScreen from '../screens/SimulationScreen';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();
const WatchlistStack = createNativeStackNavigator();

function WatchlistNavigator() {
  return (
    <WatchlistStack.Navigator screenOptions={{ headerShown: false }}>
      <WatchlistStack.Screen name="WatchlistMain" component={WatchlistScreen} />
      <WatchlistStack.Screen name="AddCompany" component={AddCompanyScreen} />
    </WatchlistStack.Navigator>
  );
}

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
        component={WatchlistNavigator}
        options={{
          tabBarLabel: '自选',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="watchlist" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matrix"
        component={MatrixScreen}
        options={{
          tabBarLabel: '矩阵',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="grid" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Simulation"
        component={SimulationScreen}
        options={{
          tabBarLabel: '模拟',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="simulation" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="gear" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Tab bar icons ─────────────────────────────────────────────────────────────

type IconName = 'bar-chart' | 'watchlist' | 'grid' | 'gear' | 'simulation';

function TabBarIcon({
  name,
  focused,
  color,
}: {
  name: IconName;
  focused: boolean;
  color: string;
}) {
  if (name === 'grid') {
    return (
      <View style={iconStyles.grid}>
        <View style={iconStyles.gridRow}>
          <View style={[iconStyles.gridCell, { borderColor: color }]} />
          <View style={[iconStyles.gridCell, { borderColor: color }]} />
        </View>
        <View style={iconStyles.gridRow}>
          <View style={[iconStyles.gridCell, { borderColor: color }]} />
          <View style={[iconStyles.gridCell, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === 'watchlist') {
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

  if (name === 'gear') {
    // Gear icon using concentric circles with notches represented by dots
    return (
      <View style={iconStyles.gearWrap}>
        <View style={[iconStyles.gearOuter, { borderColor: color }]}>
          <View style={[iconStyles.gearInner, { borderColor: color }]} />
        </View>
        {/* Gear teeth: 4 small rectangles around the outer ring */}
        <View style={[iconStyles.gearTooth, iconStyles.gearToothTop, { backgroundColor: color }]} />
        <View style={[iconStyles.gearTooth, iconStyles.gearToothBottom, { backgroundColor: color }]} />
        <View style={[iconStyles.gearTooth, iconStyles.gearToothLeft, { backgroundColor: color }]} />
        <View style={[iconStyles.gearTooth, iconStyles.gearToothRight, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'simulation') {
    // Simulation icon: up arrow + down arrow side by side
    return (
      <View style={iconStyles.simWrap}>
        <View style={iconStyles.simArrowUp}>
          <View style={[iconStyles.simArrowHead, { borderBottomColor: color }]} />
          <View style={[iconStyles.simArrowStem, { backgroundColor: color }]} />
        </View>
        <View style={iconStyles.simArrowDown}>
          <View style={[iconStyles.simArrowStem, { backgroundColor: color }]} />
          <View style={[iconStyles.simArrowHeadDown, { borderTopColor: color }]} />
        </View>
      </View>
    );
  }

  return null;
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
  grid: {
    width: 20,
    height: 20,
    gap: 3,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  gridCell: {
    flex: 1,
    borderRadius: 2,
    borderWidth: 1.5,
  },

  // Gear icon
  gearWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  gearTooth: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 1,
  },
  gearToothTop:    { top: 0,    left: 9 },
  gearToothBottom: { bottom: 0, left: 9 },
  gearToothLeft:   { left: 0,   top: 9 },
  gearToothRight:  { right: 0,  top: 9 },

  // Simulation icon (up/down arrows)
  simWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
  },
  simArrowUp: {
    alignItems: 'center',
    height: 20,
  },
  simArrowDown: {
    alignItems: 'center',
    height: 20,
  },
  simArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  simArrowHeadDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  simArrowStem: {
    width: 2,
    flex: 1,
    borderRadius: 1,
  },
});
