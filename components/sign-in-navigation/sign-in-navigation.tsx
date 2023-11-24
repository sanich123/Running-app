import RegisterNavigation from '@C/login-register-navigation/login-register-navigation';
import { useState } from 'react';

export default function SignInNavigation({ isDisabled }: { isDisabled: boolean }) {
  const [isRegister, setIsRegister] = useState(true);

  return <RegisterNavigation isDisabled={isDisabled} setIsRegister={setIsRegister} isRegister={isRegister} />;
}
