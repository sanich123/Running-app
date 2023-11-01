import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentType } from 'react';

type NavigationMockProps = {
  Controller: ComponentType<any>;
  params?: any;
};

export const NavigationMock = ({ Controller, params }: NavigationMockProps) => {
  const stack = createNativeStackNavigator<any>();

  return (
    <NavigationContainer independent>
      <stack.Navigator initialRouteName="TestRoute">
        <stack.Screen name="TestRoute" component={Controller} initialParams={params} options={{ header: () => null }} />
      </stack.Navigator>
    </NavigationContainer>
  );
};
