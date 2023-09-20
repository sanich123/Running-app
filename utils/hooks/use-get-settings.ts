import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function useGetSettings() {
  const {
    gender: savedGender,
    sport: savedSport,
    name: savedName,
    surname: savedSurname,
    city: savedCity,
    weight: savedWeight,
    bio: savedBio,
    birthday: savedBirthday,
    profile_photo: savedProfilePhoto,
  } = useSelector(({ userInfo }) => userInfo.settings);

  const [gender, setGender] = useState(savedGender);
  const [sport, setSport] = useState(savedSport);
  const [name, setName] = useState(savedName);
  const [surname, setSurname] = useState(savedSurname);
  const [city, setCity] = useState(savedCity);
  const [weight, setWeight] = useState(savedWeight);
  const [bio, setBio] = useState(savedBio);
  const [birthday, setBirthday] = useState(savedBirthday ? new Date(savedBirthday) : undefined);
  const [image, setImage] = useState(savedProfilePhoto ? savedProfilePhoto : null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  return {
    gender,
    sport,
    name,
    surname,
    city,
    weight,
    bio,
    birthday,
    image,
    isLoading,
    isDisabled,
    photoUrl,
    setGender,
    setSport,
    setName,
    setSurname,
    setCity,
    setWeight,
    setBio,
    setBirthday,
    setImage,
    setIsLoading,
    setIsDisabled,
    setPhotoUrl,
  };
}
