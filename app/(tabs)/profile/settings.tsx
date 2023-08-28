import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, SegmentedButtons, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { View } from '../../../components/Themed';
import { GENDER_TYPES, SPORT_TYPES } from '../../../constants/btns-props';

export default function ProfileSettings() {
  const [gender, setGender] = useState('');
  const [sport, setSport] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState('');
  const [bio, setBio] = useState('');
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
          <TextInput
            mode="outlined"
            style={{ width: 170 }}
            label="First Name"
            placeholder="Type your name"
            value={name}
            onChangeText={(name) => setName(name)}
          />
          <TextInput
            mode="outlined"
            style={{ width: 170 }}
            label="Last Name"
            placeholder="Type your surname"
            value={surname}
            onChangeText={(surname) => setSurname(surname)}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            mode="outlined"
            style={{ width: 170 }}
            label="City"
            placeholder="Where are you from"
            value={city}
            onChangeText={(city) => setCity(city)}
          />
          <TextInput
            mode="outlined"
            style={{ width: 170 }}
            label="Weight (kg)"
            placeholder="Type your weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={(weight) => setWeight(weight)}
          />
        </View>
        <SegmentedButtons
          value={sport}
          onValueChange={setSport}
          buttons={SPORT_TYPES}
          style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
        />
        <TextInput
          mode="outlined"
          style={{ width: 365 }}
          label="Bio"
          placeholder="Type a few words about yourself"
          multiline
          numberOfLines={4}
          value={bio}
          onChangeText={(bio) => setBio(bio)}
        />
        <View style={styles.inputWrapper}>
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={GENDER_TYPES}
            style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
          />
        </View>
        <TextInput mode="outlined" style={{ width: 365 }} label="Birth date" />
        <Button mode="outlined" style={{ width: 200, marginLeft: 15, marginRight: 15 }}>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
});
