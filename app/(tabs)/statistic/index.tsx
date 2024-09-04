import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

export default function Statistics() {
  const [selectedLanguage, setSelectedLanguage] = useState();
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Picker selectedValue={selectedLanguage} onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)} mode='dropdown'>
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
      </Picker>
    </View>
  );
}
