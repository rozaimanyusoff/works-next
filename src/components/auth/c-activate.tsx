'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@components/layouts/ui/input';
import { Button } from '@components/layouts/ui/button';
import { Tooltip, TooltipProvider } from '@components/layouts/ui/tooltip';
import Footer from '@components/layouts/footer';
import { api } from '@/config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface ValidateActivationResponse {
    valid: boolean;
}

const ComponentActivate = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activationCode = searchParams.get('code');

    const [formData, setFormData] = useState({
        email: '',
        contact: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [isValidated, setIsValidated] = useState(false);
    const [responseMessage, setResponseMessage] = useState({
        text: !isValidated ? 'Enter your email & contact to verify' : 'Create your password',
        type: 'info',
    });
    const [fieldErrors, setFieldErrors] = useState({
        username: false,
        password: false,
        confirmPassword: false,
        contact: false,
        email: false,
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
    });

    // --- Unnecessary: useEffect for activationCode error message (not performance related) ---
    useEffect(() => {
        if (!activationCode) {
            setResponseMessage({ text: 'Invalid activation link', type: 'error' });
        }
    }, [activationCode]);

    // --- Unnecessary: handleChange, handleKeyPress, togglePassword (UI only) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        setFieldErrors((prev) => ({
            ...prev,
            [id]: false,
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const charCode = e.key;
        if (!/^[0-9]$/.test(charCode)) {
            e.preventDefault();
        }
    };

    const togglePassword = (field: 'password' | 'confirmPassword') => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // --- FOCUS: handleValidate and handleActivate are the only performance-relevant parts ---
    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activationCode) {
            setResponseMessage({ text: 'Invalid activation code', type: 'error' });
            return;
        }
        try {
            setResponseMessage({ text: 'Validating...', type: 'info' });
            // --- API call: this is where slowness would occur if backend is slow ---
            const response = await api.post('/api/auth/validate-activation', {
                email: formData.email,
                contact: formData.contact,
                activationCode: activationCode,
            });
            const data = response.data as any;
            if (data.status === 'success') {
                setIsValidated(true);
                setResponseMessage({
                    text: data.message || 'Validation successful! Create your password',
                    type: 'success',
                });
            } else {
                setResponseMessage({
                    text: data.message || 'Validation failed',
                    type: 'error',
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Validation failed';
            setResponseMessage({ text: errorMessage, type: 'error' });
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        let hasErrors = false;
        const newFieldErrors = { ...fieldErrors };

        if (!formData.username) {
            newFieldErrors.username = true;
            setResponseMessage({ text: 'Username is required', type: 'error' });
            hasErrors = true;
        }

        if (formData.password !== formData.confirmPassword) {
            newFieldErrors.password = true;
            newFieldErrors.confirmPassword = true;
            setResponseMessage({ text: 'Passwords do not match', type: 'error' });
            hasErrors = true;
        }

        setFieldErrors(newFieldErrors);

        if (hasErrors) return;

        try {
            setResponseMessage({ text: 'Activating account...', type: 'info' });
            // --- API call: this is where slowness would occur if backend is slow ---
            await api.post('/api/auth/activate', {
                email: formData.email,
                contact: formData.contact,
                username: formData.username,
                password: formData.password,
                activationCode: activationCode,
            });

            setResponseMessage({
                text: 'Account activated successfully! Redirecting...',
                type: 'success',
            });

            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Activation failed';
            setResponseMessage({ text: errorMessage, type: 'error' });
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
                    <div className="relative flex w-full flex-col items-center justify-center gap-5 px-4 py-3 sm:px-6 lg:max-w-[400px]">
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase leading-snug! text-dark md:text-4xl">Activation</h1>
                                <p className={`font-bold leading-normal ${responseMessage.type === 'error'
                                        ? 'text-red-500'
                                        : responseMessage.type === 'success'
                                            ? 'text-green-500'
                                            : 'text-black'
                                    }`}>
                                    {responseMessage.text}
                                </p>
                            </div>
                            <form className="space-y-3" onSubmit={!isValidated ? handleValidate : handleActivate}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isValidated}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                                    <Input
                                        id="contact"
                                        type="text"
                                        placeholder="Enter Contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        onKeyPress={handleKeyPress}
                                        disabled={isValidated}
                                    />
                                </div>

                                {isValidated && (
                                    <>
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username
                                                <span>
                                                    <Tooltip content="You can use both email or username as credentials. For employees, prefer using Employee ID." placement="top" variant='secondary'>
                                                        <span className="ml-2 text-blue-600">
                                                            <FontAwesomeIcon icon={faInfoCircle} size='lg' />
                                                        </span>
                                                    </Tooltip>
                                                </span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder="Enter Username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword.password ? 'text' : 'password'}
                                                    placeholder="Enter Password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500"
                                                    onClick={() => togglePassword('password')}
                                                >
                                                    <FontAwesomeIcon icon={showPassword.password ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500"
                                                    onClick={() => togglePassword('confirmPassword')}
                                                >
                                                    <FontAwesomeIcon icon={showPassword.confirmPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Button type="submit" variant="outline" size="lg" className="w-full">
                                    {!isValidated ? 'Verify' : 'Activate Account'}
                                </Button>
                            </form>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentActivate