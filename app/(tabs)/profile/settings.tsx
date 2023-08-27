import { ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { View } from '../../../components/Themed';

export default function ProfileSettings() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Avatar.Image
          size={100}
          source={() => <Icon name="person" size={64} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
        <Button mode="outlined" icon="camera">
          Upload an avatar
        </Button>
        <View style={styles.inputWrapper}>
          <TextInput mode="outlined" style={{ width: 170 }} label="First Name" placeholder="Type your name" />
          <TextInput mode="outlined" style={{ width: 170 }} label="Last Name" placeholder="Type your surname" />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput mode="outlined" style={{ width: 170 }} label="City" placeholder="Where are you from" />
          <TextInput mode="outlined" style={{ width: 170 }} label="State" placeholder="YOur Country" />
        </View>
        <TextInput mode="outlined" style={{ width: 365 }} label="Primary sport" />
        <TextInput
          mode="outlined"
          style={{ width: 365 }}
          label="Bio"
          placeholder="Type a few words about yourself"
          multiline
          numberOfLines={4}
        />
        <View style={styles.inputWrapper}>
          <TextInput mode="outlined" style={{ width: 170 }} label="Gender" placeholder="Type your gender" />
          <TextInput mode="outlined" style={{ width: 170 }} label="Weight (kg)" placeholder="Type your weight" />
        </View>
        <TextInput mode="outlined" style={{ width: 365 }} label="Birth date" />
        <Button mode="outlined" style={{ width: '100%' }}>
          Save
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginTop: 40,
    marginBottom: 40,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 25,
  },
});
