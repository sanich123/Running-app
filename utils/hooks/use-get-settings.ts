import { useState } from 'react';

export default function useGetSettings() {
  const [gender, setGender] = useState('');
  const [sport, setSport] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState(undefined);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

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
  };
}
