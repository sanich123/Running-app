import { useState } from 'react';

import { useAuth } from '../../auth/context/auth-context';
import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';

export default function useGetSettings() {
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

  return {
    gender,
    name,
    surname,
    city,
    weight,
    image,
    isDisabled,
    photoUrl,
    bio,
    setGender,
    setName,
    setSurname,
    setCity,
    setWeight,
    setBio,
    setImage,
    setIsDisabled,
    setPhotoUrl,
  };
}
