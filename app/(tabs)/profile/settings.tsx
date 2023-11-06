import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import { View } from '../../../components/Themed';
import AvatarIconEditable from '../../../components/avatar-editable/avatar-editable';
import GenderBtns from '../../../components/gender-btns/gender-btns';
import InputBio from '../../../components/input-bio/input-bio';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import { saveSettingsInfo } from '../../../redux/profile/profile';
import { useGetUserProfileByIdQuery } from '../../../redux/runich-api/runich-api';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(user.id);
  const [gender, setGender] = useState(profileInfo?.gender);
  const [name, setName] = useState(profileInfo?.name);
  const [surname, setSurname] = useState(profileInfo?.surname);
  const [city, setCity] = useState(profileInfo?.city);
  const [weight, setWeight] = useState(profileInfo?.weight);
  const [bio, setBio] = useState(profileInfo?.bio);
  const [image, setImage] = useState(profileInfo?.profilePhoto);
  const [isDisabled, setIsDisabled] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const dispatch = useDispatch();
  //delete useGetSEttings?
  dispatch(
    saveSettingsInfo({
      gender,
      name,
      surname,
      city,
      weight,
      bio,
      profilePhoto: photoUrl ? photoUrl : image,
    }),
  );

  return (
    <View style={styles.container}>
      <AvatarIconEditable
        image={image}
        setImage={setImage}
        setIsDisabled={setIsDisabled}
        setPhotoUrl={setPhotoUrl}
        isDisabled={isDisabled}
      />
      <InputsNameSurname
        name={name}
        surname={surname}
        setName={setName}
        setSurname={setSurname}
        isDisabled={isDisabled}
      />
      <InputsWeightCity city={city} setCity={setCity} weight={weight} setWeight={setWeight} isDisabled={isDisabled} />
      <InputBio bio={bio} setBio={setBio} isDisabled={isDisabled} />
      <GenderBtns gender={gender} setGender={setGender} isDisabled={isDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    paddingTop: 40,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
});
