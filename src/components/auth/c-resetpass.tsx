'use client';

import { useState, useEffect } from 'react';
import { api } from '@/config/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { validatePassword } from '@/lib/passwordValidator';
import Link from 'next/link';
import Footer from '@components/layouts/footer';
import { Input } from '@components/layouts/ui/input';
import { Button } from '@components/layouts/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const decodeResetToken = (token: string) => {
  try {
    const [payloadBase64] = token.split('-');
    const decodedString = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(decodedString);

    return {
      email: payload.e || '',
      contact: payload.c || '',
      expiry: payload.x || 0,
      valid: payload.x ? parseInt(payload.x) > Date.now() : false,
    };
  } catch (error) {
    console.error('Token decode error:', error);
    return {
      email: '',
      contact: '',
      expiry: 0,
      valid: false,
    };
  }
};

const verifyResetToken = async (token: string): Promise<VerifyResponse> => {
  try {
    const response = await api.post('/api/auth/verifytoken', { token });
    return response.data as VerifyResponse; // Explicitly cast response.data to VerifyResponse
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return { valid: false, message: error.response?.data?.message || 'Error verifying token' };
  }
};

interface VerifyResponse {
  valid: boolean;
  message?: string;
  email?: string;
  contact?: string;
}

const ComponentResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  const [formData, setFormData] = useState({
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [isValidated, setIsValidated] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    text: 'Enter your email and contact number for verification',
    type: 'default',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    contact: false,
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({ email: false, contact: false, password: false, confirmPassword: false });

    if (!resetToken) {
      setResponseMessage({
        text: 'Invalid reset link',
        type: 'error',
      });
      return;
    }

    const verifyResponse = await verifyResetToken(resetToken);

    if (!verifyResponse.valid) {
      setResponseMessage({
        text: verifyResponse.message || 'Reset link is invalid or expired',
        type: 'error',
      });
      return;
    }

    if (
      formData.email.toLowerCase() !== verifyResponse.email?.toLowerCase() ||
      formData.contact !== verifyResponse.contact
    ) {
      setFieldErrors({
        email: formData.email.toLowerCase() !== verifyResponse.email?.toLowerCase(),
        contact: formData.contact !== verifyResponse.contact,
        password: false,
        confirmPassword: false,
      });

      setResponseMessage({
        text: 'Invalid credentials. Please try again.',
        type: 'error',
      });
      return;
    }

    setIsValidated(true);
    setResponseMessage({
      text: 'Identity verified. Please set your new password.',
      type: 'success',
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handlePasswordSubmit triggered');
    setFieldErrors({ email: false, contact: false, password: false, confirmPassword: false });

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setFieldErrors((prev) => ({ ...prev, password: true }));
      setResponseMessage({
        text: passwordValidation.message,
        type: 'error',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, password: true, confirmPassword: true }));
      setResponseMessage({
        text: 'Passwords do not match',
        type: 'error',
      });
      return;
    }

    try {
      const response = await api.post('/api/auth/update-password', {
        token: resetToken,
        email: formData.email,
        contact: formData.contact,
        newPassword: formData.password,
      });

      setResponseMessage({
        text: 'Password reset successful! Redirecting to login...',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setResponseMessage({
        text: error.response?.data?.message || 'Error resetting password',
        type: 'error',
      });
    }
  };

  return (
    <div>
      <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-fuchsia-300"></div>
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10 dark:bg-[#060818] sm:px-16">
        <div className="relative flex w-full max-w-[1000px] flex-col justify-between overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg dark:bg-black/50 lg:min-h-[600px] lg:flex-row xl:gap-0">
          <div className="relative hidden w-full items-center justify-center backdrop-blur-xs lg:inline-flex lg:max-w-[835px] xl:-ms-28">
            <div className="hidden w-full h-full bg-gray-200 lg:block">
              <img src="/assets/images/auth/pexels.jpg" alt="Cover Image" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-5 px-4 py-6 sm:px-6 lg:max-w-[400px]">
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase leading-snug! text-dark md:text-4xl">Reset Password</h1>
                <p className="text-base font-bold leading-normal text-white-dark">
                  {responseMessage.text && <span className={`block mt-2 ${responseMessage.type === 'error' ? 'text-red-500' : responseMessage.type === 'success' ? 'text-green-600' : 'text-black'}`}>{responseMessage.text}</span>}
                </p>
              </div>
              {!isValidated ? (
                <form className="space-y-3" onSubmit={handleValidationSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                    <Input
                      id="contact"
                      name="contact"
                      type="text"
                      required
                      placeholder="Enter your contact number"
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handleValidationSubmit(e); // Call the appropriate handler
                    }}
                  >
                    Verify Identity
                  </Button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={handlePasswordSubmit}>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your new password"
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='lg' />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Confirm your new password"
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='lg' />
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePasswordSubmit(e);
                    }}
                  >
                    Reset Password
                  </Button>
                </form>
              )}
              <div className="relative flex items-center justify-center font-semibold my-7 text-center md:mb-9">
                <div className="text-center dark:text-white">
                  <Link href="/auth/login" className="capitalize no-underline font-bold text-blue-600 transition hover:text-black dark:hover:text-white">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentResetPassword;