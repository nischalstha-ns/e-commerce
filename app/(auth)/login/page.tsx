'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
      // Add timeout to prevent hanging
      await Promise.race([
        signInWithEmailAndPassword(auth, formData.email, formData.password),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        )
      ]);
      
      toast.success('Successfully signed in!');
      // Navigate immediately, don't wait for role check
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#121212] dark:to-[#1a1a1a] p-4 theme-transition">
      <div className="w-full max-w-md auth-container">
        <div className="text-center mb-8">
          <img className="h-16 mx-auto mb-4" src="/logo.jpg" alt="logo" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] theme-transition">Welcome Back</h1>
          <p className="text-gray-600 dark:text-[#9ca3af] mt-2 theme-transition">Sign in to your account</p>
        </div>

        <Card className="shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] dark:bg-[#1e1e1e] theme-transition">
          <CardBody className="p-8">
            <form onSubmit={handleEmailLogin} className="space-y-6">
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
                placeholder="Enter your password"
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

              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline theme-transition"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-[#9ca3af] theme-transition">
                Don't have an account?{' '}
                <Link 
                  href="/sign-up" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline theme-transition"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}