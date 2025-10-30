'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@heroui/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import AnimatedLoginRing from '../../components/AnimatedLoginRing';
import { auth } from '@/lib/firestore/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error('Authentication service unavailable');
      }
      
      if (!validateForm()) return;
      
      await Promise.race([
        signInWithEmailAndPassword(auth, formData.email, formData.password),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        )
      ]);
      
      toast.success('Successfully signed in!');
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      if (error.message === 'Login timeout') {
        errorMessage = 'Login is taking too long. Please try again.';
      } else {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'Invalid email or password';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection';
            break;
          default:
            errorMessage = error.message || 'An error occurred during sign in';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    try {
      if (!formData.email || !validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      return true;
    } catch (error) {
      toast.error('Form validation failed');
      return false;
    }
  };

  return (
    <AnimatedLoginRing>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <img className="h-12 mx-auto mb-4" src="/logo.jpg" alt="logo" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300 text-sm">Sign in to your account</p>
        </div>

        {/* Login Box */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="Enter your password"
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

            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Don't have an account?{' '}
            <Link 
              href="/sign-up" 
              className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AnimatedLoginRing>
  );
}