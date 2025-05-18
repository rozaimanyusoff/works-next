'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@components/layouts/ui/input';
import { Button } from '@components/layouts/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@components/layouts/ui/select';
import Footer from '@components/layouts/footer';
import { api } from '@/config/api';


interface RegisterResponse {
    message: string;
}

const ComponentRegister = () => {
    const router = useRouter();
    const [responseMessage, setResponseMessage] = useState<string | null>('Create your account by filling the form below');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        userType: '',
    });

    const handleChange = (e: { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { name, email, contact, userType } = formData;

        try {
            const response = await api.post<RegisterResponse>('/api/auth/register', { name, email, contact, userType });
            if (response.data.message) {
                setResponseMessage('Registration successful! Please log in.');
                setTimeout(() => router.push('/auth/login'), 2000); // Redirect to login page after 2 seconds
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setResponseMessage('Registration failed. Please try again.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const charCode = e.key;
        if (!/^[0-9]$/.test(charCode)) {
            e.preventDefault();
        }
    };

    return (
        <div>
            <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-fuchsia-300"></div>
            <div className="relative flex min-h-screen items-center justify-center px-6 py-10 dark:bg-[#060818] sm:px-16">
                <div className="relative flex w-full max-w-[1000px] flex-col justify-between overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg dark:bg-black/50 lg:min-h-[500px] lg:flex-row xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center backdrop-blur-xs lg:inline-flex lg:max-w-[835px] xl:-ms-28">
                        <div className="hidden w-full h-full bg-gray-200 lg:block">
                            <img src="/assets/images/auth/pexels.jpg" alt="Cover Image" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-5 px-4 py-1 sm:px-6 lg:max-w-[400px]">
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase leading-snug! text-dark md:text-4xl">Register</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">
                                    {responseMessage && (
                                        <span className={`block mt-2 text-sm ${responseMessage.includes('failed') ? 'text-red-500' : responseMessage.includes('successful') ? 'text-green-600' : 'text-black'}`}>{responseMessage}</span>
                                    )}
                                </p>
                            </div>
                            {/* Register form */}
                            <form className="space-y-3" onSubmit={handleRegister}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Enter your full name"
                                        size="md"
                                        value={formData.name}
                                        className='capitalize'
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        size="md"
                                        value={formData.email}
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
                                        size="md"
                                        maxLength={12}
                                        value={formData.contact}
                                        onChange={handleChange}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
                                    <Select
                                        required
                                        value={formData.userType}
                                        onValueChange={(value) => setFormData((prevData) => ({ ...prevData, userType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Employee</SelectItem>
                                            <SelectItem value="2">Non-Employee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <Button type="submit" variant="outline" size="lg" className="w-full">Sign Up</Button>
                            </form>

                            <div className="relative flex items-center justify-center font-semibold my-7 text-center md:mb-9">
                                <div className="text-center dark:text-white">
                                    Already a members ?&nbsp;
                                    <Link href="/auth/login" className="capitalize no-underline font-bold text-blue-600 transition hover:text-black dark:hover:text-white">
                                        Log In
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

export default ComponentRegister;