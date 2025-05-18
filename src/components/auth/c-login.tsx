'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@components/layouts/ui/input';
import { Button } from '@components/layouts/ui/button';
import Footer from '@components/layouts/footer';
import { api } from '@/config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '@/store/AuthContext';

interface LoginResponse {
    token: string;
    data: {
        user: {
            id: number;
            email: string;
            username: string;
            contact: string;
            name: string;
            userType: number;
            status: number;
            lastNav: string;
            role: {
                id: number;
                name: string;
            };
            profile: {
                user_id: number;
                dob: string;
                location: string;
                job: string;
                profile_image_url: string;
            };
        };
        usergroups: Array<{
            id: number;
            name: string;
        }>;
        navTree: Array<{
            navId: number;
            title: string;
            type: string;
            position: number;
            status: number;
            path: string | null;
            parent_nav_id: number | null;
            section_id: number | null;
            children: any[] | null;
        }>;
    };
}

const ComponentLogin = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        // Redirect to lastNav if user is already authenticated
        if (authContext?.authData) {
            const lastNav = authContext.authData.user?.lastNav;
            const redirectPath = lastNav && lastNav.startsWith('/') ? lastNav : '/analytics';
            router.push(redirectPath);
        }
    }, [authContext, router]);

    if (authContext?.authData) {
        // Prevent rendering the login page if the user is authenticated
        return null;
    }

    const getMessageClass = (message: string | null) => {
        if (message?.toLowerCase().includes('error') || message?.toLowerCase().includes('invalid')) {
            return 'text-red-500';
        } else if (message?.toLowerCase().includes('success')) {
            return 'text-green-600';
        } else {
            return 'text-black';
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const emailOrUsername = formData.get('emailOrUsername') as string;
        const password = formData.get('password') as string;

        try {
            const response = await api.post<LoginResponse>('/api/auth/login', { emailOrUsername, password });
            if (response.data.token) {
                if (authContext && authContext.setAuthData) {
                    authContext.setAuthData({
                        token: response.data.token,
                        user: response.data.data.user,
                        usergroups: response.data.data.usergroups,
                        navTree: response.data.data.navTree,
                    });
                } else {
                    console.error('AuthContext is not properly initialized.');
                }

                // Safely access lastNav or fallback to /analytics
                const redirectPath = response.data.data.user?.lastNav?.startsWith('/') ? response.data.data.user.lastNav : '/analytics';
                router.push(redirectPath);
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
            setResponseMessage(errorMessage);
        }
    };

    return (
        <div>
            <div className="absolute inset-0"></div>
            <div className="relative flex min-h-screen items-center justify-center px-6 py-10 bg-neutral-200 dark:bg-[#060818] sm:px-16">
                <div className="panel flex w-full items-center justify-center gap-5 px-4 py-6 sm:px-6 lg:max-w-[400px]">
                    <div className="w-full max-w-[440px] my-6">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold uppercase leading-snug! text-dark md:text-4xl">Login</h1>
                            <p className="text-base font-bold leading-normal text-white-dark">
                                {responseMessage && <span className={`block mt-2 text-sm ${getMessageClass(responseMessage)}`}>{responseMessage}</span>}
                            </p>
                        </div>
                        {/* Login form */}
                        <form className="space-y-3" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">Email or Username</label>
                                <Input id="emailOrUsername" name="emailOrUsername" type="text" required placeholder="Enter your email or username" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your password"
                                        size="md"
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
                            <Button type="submit" variant="outline" size="lg" className="w-full">Sign In</Button>
                        </form>

                        <div className="relative flex items-center justify-between font-semibold my-7 text-center md:mb-9">
                            <div className="text-center dark:text-white">
                                <Link href="/auth/forgot-password" className="capitalize no-underline font-bold text-blue-600 transition hover:text-black dark:hover:text-white">
                                    Forgot Password?
                                </Link>
                            </div>

                            <div className="text-center dark:text-white">
                                Not a member ?&nbsp;
                                <Link href="/auth/register" className="capitalize no-underline font-bold text-blue-600 transition hover:text-black dark:hover:text-white">
                                    Register
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

export default ComponentLogin;