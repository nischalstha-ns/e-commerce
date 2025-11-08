'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { auth } from '@/lib/firestore/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AnimatedLoginRing from '../../components/AnimatedLoginRing';
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
    <div suppressHydrationWarning>
      <AnimatedLoginRing>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-sm px-4">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              className="h-12 mx-auto mb-4 dark:bg-white dark:rounded-lg dark:p-1" 
              src="https://res.cloudinary.com/dwwypumxh/image/upload/v1762531629/NFS_Logo_PNG_z5qisi.png" 
              alt="Nischal Fancy Store" 
            />
            <h1 className="text-2xl font-bold text-white mb-2">Register</h1>
            <p className="text-gray-300 text-sm">Create your account</p>
          </div>

          {/* Sign Up Box */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                classNames={{
                  input: "bg-transparent text-white",
                  inputWrapper: "bg-gray-700/50 border-gray-600 hover:border-blue-400",
                  label: "text-gray-300"
                }}
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
                classNames={{
                  input: "bg-transparent text-white",
                  inputWrapper: "bg-gray-700/50 border-gray-600 hover:border-blue-400",
                  label: "text-gray-300"
                }}
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
                    className="text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                variant="bordered"
                classNames={{
                  input: "bg-transparent text-white",
                  inputWrapper: "bg-gray-700/50 border-gray-600 hover:border-blue-400",
                  label: "text-gray-300"
                }}
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
                classNames={{
                  input: "bg-transparent text-white",
                  inputWrapper: "bg-gray-700/50 border-gray-600 hover:border-blue-400",
                  label: "text-gray-300"
                }}
                isRequired
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Create Account
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-300 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </AnimatedLoginRing>
    </div>
  );
}