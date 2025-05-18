'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@components/layouts/ui/input';
import { Button } from '@components/layouts/ui/button';
import Footer from '@components/layouts/footer';
import { api } from '@/config/api';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [responseMessage, setResponseMessage] = useState({
        text: 'Enter your email to reset your password',
        type: 'info',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setResponseMessage({ text: 'Processing...', type: 'info' });

            await api.post('/api/auth/reset-password', { email, contact });

            setResponseMessage({
                text: 'Password reset link sent! Please check your email.',
                type: 'success',
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset link';
            setResponseMessage({ text: errorMessage, type: 'error' });
        }
    };

    return (
        <div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-fuchsia-300"></div>
            <div className="relative flex min-h-screen items-center justify-center px-6 py-10 dark:bg-[#060818] sm:px-16">
                <div className="relative flex w-full max-w-[1000px] flex-col justify-between overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg dark:bg-black/50 lg:min-h-[600px] lg:flex-row xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center backdrop-blur-sm lg:inline-flex lg:max-w-[835px] xl:-ms-28">
                        <div className="hidden w-full h-full bg-gray-200 lg:block">
                            <img src="/assets/images/auth/pexels.jpg" alt="Cover Image" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-5 px-4 py-6 sm:px-6 lg:max-w-[400px]">
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-dark md:text-4xl">Lost Password</h1>
                                <p className={`font-bold leading-normal ${
                                    responseMessage.type === 'error'
                                        ? 'text-red-500'
                                        : responseMessage.type === 'success'
                                            ? 'text-green-500'
                                            : 'text-black'
                                }`}>
                                    {responseMessage.text}
                                </p>
                            </div>
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                                    <Input
                                        id="contact"
                                        type="text"
                                        placeholder="Enter your contact number"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="outline" size="lg" className="w-full">
                                    Send Reset Link
                                </Button>
                            </form>
                            <div className="relative flex items-center justify-center font-semibold my-7 text-center md:mb-9">
                                Remember your password ?&nbsp;
                                <Link href="/auth/login" className="capitalize no-underline font-bold text-blue-600 transition hover:text-black dark:hover:text-white">
                                     Log in
                                </Link>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;