import { useState } from 'react';

import LoginNavigation from '../login-navigation/login-navigation';
import RegisterNavigation from '../login-register-navigation/login-register-navigation';

export default function SignInNavigation({ isDisabled }: { isDisabled: boolean }) {
  const [isRegister, setIsRegister] = useState(true);

  return (
    <>
      {isRegister ? (
        <RegisterNavigation isDisabled={isDisabled} setIsRegister={setIsRegister} />
      ) : (
        <LoginNavigation isDisabled={isDisabled} setIsRegister={setIsRegister} />
      )}
    </>
  );
}
