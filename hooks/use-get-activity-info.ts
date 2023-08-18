import { useState } from 'react';

export default function UseGetActivityInfo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isSwitchOn, setIsSwitchOn] = useState(false);
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
  };
}