
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordConfirmationProps {
  password: string;
  confirmPassword: string;
}

const PasswordConfirmation = ({ password, confirmPassword }: PasswordConfirmationProps) => {
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  if (!confirmPassword) return null;

  return (
    <div className="flex items-center space-x-2">
      {passwordsMatch ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
      </span>
    </div>
  );
};

export default PasswordConfirmation;
