'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { auth } from '@/lib/firestore/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AnimatedRing from '../../components/AnimatedRing';
import ThemeToggle from '../../components/ThemeToggle';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    try {
      if (!field || typeof value !== 'string') return;
      setFormData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Input change error:', error);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error('Authentication service unavailable');
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      if (userCredential.user && formData.name) {
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
      }

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email is already registered';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = error.message || 'An error occurred';
        }
      }
      
      toast.error(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign-up error:', { code: error?.code, message: error?.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#121212] dark:to-[#1a1a1a] p-4 theme-transition relative overflow-hidden">
      <AnimatedRing />
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200 dark:border-[#2e2e2e] theme-transition">
          <ThemeToggle />
        </div>
      </div>
      <div className="w-full max-w-md auth-container relative z-10">
        <div className="text-center mb-8">
          <img className="h-16 mx-auto mb-4" src="/logo.jpg" alt="logo" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Create Account</h1>
          <p className="text-gray-600 dark:text-[#9ca3af] mt-2 theme-transition">Join us today</p>
        </div>

        <Card className="shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-white dark:bg-[#1e1e1e] border-0 dark:border dark:border-[#2e2e2e] theme-transition">
          <CardBody className="p-3">
            <form onSubmit={handleSignUp} className="space-y-6">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400 dark:text-[#9ca3af]" />}
                variant="bordered"
                classNames={{
                  input: "bg-transparent dark:text-[#f3f4f6]",
                  inputWrapper: "bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 theme-transition",
                  label: "text-gray-700 dark:text-[#e5e7eb]"
                }}
                isRequired
              />

              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400 dark:text-[#9ca3af]" />}
                variant="bordered"
                classNames={{
                  input: "bg-transparent dark:text-[#f3f4f6]",
                  inputWrapper: "bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 theme-transition",
                  label: "text-gray-700 dark:text-[#e5e7eb]"
                }}
                isRequired
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400 dark:text-[#9ca3af]" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 dark:text-[#9ca3af] hover:text-gray-600 dark:hover:text-gray-300 theme-transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                variant="bordered"
                classNames={{
                  input: "bg-transparent dark:text-[#f3f4f6]",
                  inputWrapper: "bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 theme-transition",
                  label: "text-gray-700 dark:text-[#e5e7eb]"
                }}
                isRequired
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400 dark:text-[#9ca3af]" />}
                variant="bordered"
                classNames={{
                  input: "bg-transparent dark:text-[#f3f4f6]",
                  inputWrapper: "bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 theme-transition",
                  label: "text-gray-700 dark:text-[#e5e7eb]"
                }}
                isRequired
              />

              <Button
                type="submit"
                color="primary"
                className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium glow-hover theme-transition"
                size="lg"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-[#9ca3af] theme-transition">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline theme-transition"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}