'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithGitHub } = useAuth();

  const handleGitHubSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signInWithGitHub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="flex flex-col md:flex-row gap-12 items-center justify-center w-full max-w-4xl border-border bg-card shadow-xl p-8">
        {/* Drawing Placeholder */}
        <div className="hidden md:block w-full max-w-md">
          <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="https://ouoydyymdhofhzrrvndv.supabase.co/storage/v1/object/public/public-assets//invrstrack-login-image.png"
              alt="Cozy workspace illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        {/* Login Content */}
        <div className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-foreground">Welcome to InvesTrack!</CardTitle>
            <CardDescription className="text-center mb-4 text-foreground">
              Track and manage all your investments in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 text-sm text-center mb-4">{error}</div>
            )}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder=""
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
                  <span className="text-xs text-blue-600 hover:text-blue-500 cursor-pointer">Forgot password?</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder=""
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-600/80 hover:backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled
              >
                Log In
              </button>
            </form>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-4 text-gray-400 text-sm">Or log in with</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>
            <div className="flex gap-4 justify-center">
              {/* Google icon */}
              <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm" disabled>
                <span className="text-2xl">G</span>
              </button>
              {/* Apple icon */}
              <button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm" disabled>
                <span className="text-2xl"></span>
              </button>
              {/* GitHub icon */}
              <button
                onClick={handleGitHubSignIn}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
              >
                <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-foreground">
              New here? <span className="text-blue-600 hover:text-blue-500 cursor-pointer">Create an account</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
} 