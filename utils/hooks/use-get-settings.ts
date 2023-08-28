import { useState } from 'react';

export default function useGetSettings() {
  const [gender, setGender] = useState('');
  const [sport, setSport] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState('');
  const [bio, setBio] = useState('');
  const [inputDate, setInputDate] = useState(undefined);
  const [image, setImage] = useState(null);
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
    inputDate,
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
    setInputDate,
    setImage,
    setIsLoading,
    setIsDisabled,
    setPhotoUrl,
  };
}
