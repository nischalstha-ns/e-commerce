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
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
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
        default:
          errorMessage = error.message || 'An error occurred';
      }
      
      toast.error(errorMessage);
    }
    setIsLoading(false);
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#121212] dark:to-[#1a1a1a] p-4 theme-transition relative overflow-hidden">
      <AnimatedRing />
      <div className="w-full max-w-md auth-container relative z-10">
        <div className="text-center mb-8">
          <img className="h-16 mx-auto mb-4" src="/logo.jpg" alt="logo" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Create Account</h1>
          <p className="text-gray-600 dark:text-[#9ca3af] mt-2 theme-transition">Join us today</p>
        </div>

        <Card className="shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] dark:bg-[#1e1e1e] theme-transition">
          <CardBody className="p-3">
            <form onSubmit={handleSignUp} className="space-y-6">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                isRequired
              />

              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                isRequired
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                variant="bordered"
                isRequired
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                isRequired
              />

              <Button
                type="submit"
                color="primary"
                className="w-full"
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