import { useState } from 'react';

export default function useGetActivityInfo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([] as string[]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  return {
    title,
    setTitle,
    description,
    setDescription,
    sport,
    setSport,
    emotion,
    setEmotion,
    isSwitchOn,
    setIsSwitchOn,
    photoUrls,
    setPhotoUrls,
    isDisabled,
    setIsDisabled,
    images,
    setImages,
    isLoading,
    setIsLoading,
  };
}
