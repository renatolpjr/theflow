
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Key } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    registrationToken: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'signup') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        toast.success('Account created successfully! Logging you in...');

        // Auto login after signup
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Login failed after signup');
        }

        router.push('/dashboard');
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Invalid email or password');
        }

        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-20 text-6xl opacity-5">🗽</div>
      <div className="absolute bottom-20 right-20 text-6xl opacity-5">🎓</div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo with Clean Design */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-6 ring-4 ring-[#DC2626] rounded-full shadow-lg">
            <Image
              src="/logo-new.jpeg"
              alt="The Flow English Trainer"
              fill
              className="object-cover rounded-full"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
            The FLOW English Trainer
          </h1>
          <p className="text-slate-600 text-base font-medium">Master American English 🇺🇸</p>
        </div>

        <Card className="shadow-lg border border-slate-200 bg-white">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-[#1e3a5f]">
              {type === 'login' ? 'Welcome Back! 👋' : 'Join The Flow! 🚀'}
            </CardTitle>
            <CardDescription className="text-center text-slate-600 text-base">
              {type === 'login' 
                ? 'Continue your journey to English fluency!' 
                : 'Start your American English adventure today!'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-[#DC2626]" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[#DC2626]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#DC2626]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-[#DC2626] transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {type === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="registrationToken" className="text-sm font-medium text-slate-700">Registration Token</Label>
                  <div className="relative">
                    <Key className="absolute left-4 top-3.5 h-5 w-5 text-[#DC2626]" />
                    <Input
                      id="registrationToken"
                      name="registrationToken"
                      type="text"
                      placeholder="Enter your registration token"
                      value={formData.registrationToken}
                      onChange={handleInputChange}
                      className="pl-12"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5">
                    You need a registration token to create an account. Contact an admin to get one.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#DC2626] hover:bg-[#b91c1c] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  type === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <Link
                  href={type === 'login' ? '/auth/signup' : '/auth/login'}
                  className="font-semibold text-[#DC2626] hover:text-[#b91c1c] transition-all"
                >
                  {type === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
