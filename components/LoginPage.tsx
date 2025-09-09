import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginPageProps {
  role: 'student' | 'admin';
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ role, onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = role === 'admin';
  const title = isAdmin ? 'تسجيل دخول المدرّس' : 'تسجيل دخول الطالب';
  const welcomeMessage = isAdmin ? 'أدخل بياناتك لإدارة المنصة.' : 'مرحباً بعودتك! أدخل بياناتك للمتابعة.';
  const adminCredentials = { email: 'admin@educational-platform.com', password: 'admin123' };
  const studentCredentials = { email: 'ali@example.com', pass: 'student123' };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use Supabase authentication for both admin and student login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Authentication error:', error);
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        // Log user data to debug
        console.log('Login successful, user data:', data.user);
        console.log('User metadata:', data.user?.user_metadata);
        console.log('Expected role:', role);
        console.log('Actual role from metadata:', data.user?.user_metadata?.role);
        
        // Check if user role exists in metadata
        const userRole = data.user?.user_metadata?.role;
        
        // If role doesn't exist in metadata or doesn't match selected role
        if (!userRole) {
          console.log('Role not found in metadata, updating user metadata');
          
          // Update user metadata with the selected role
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: role }
          });
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
            setError('حدث خطأ أثناء تحديث بيانات المستخدم. يرجى المحاولة مرة أخرى.');
            await supabase.auth.signOut();
          } else {
            console.log('User metadata updated successfully with role:', role);
            onLoginSuccess();
          }
        } else if (userRole !== role) {
          // Role exists but doesn't match selected role
          console.error(`Role mismatch: Expected ${role}, got ${userRole}`);
          setError(`هذا الحساب مسجل كـ ${userRole === 'admin' ? 'مدرّس' : 'طالب'}. الرجاء اختيار الدور الصحيح.`);
          await supabase.auth.signOut(); // Sign out if role doesn't match
        } else {
          // Role exists and matches selected role
          console.log('Role matches selected role, proceeding with login');
          onLoginSuccess();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-sky-400 p-4">
       <button onClick={onBack} aria-label="العودة" className="absolute top-6 right-6 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
      <div className="w-full max-w-md animate-fade-in">
        <form
          onSubmit={handleLogin}
          className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-8 space-y-6 text-white"
        >
          <div className="text-center">
            <h1 className="text-3xl font-black mb-2">{title}</h1>
            <p className="text-white/80">{welcomeMessage}</p>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-semibold">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-white/30 rounded-lg placeholder-white/70 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300"
              placeholder={isAdmin ? adminCredentials.email : 'student@example.com'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-semibold">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-white/30 rounded-lg placeholder-white/70 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-center bg-red-500/50 text-white py-2 rounded-lg">{error}</p>}

          {isAdmin && (
            <div className="bg-blue-500/30 text-white p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">بيانات تسجيل الدخول للمدرّس:</p>
              <p>البريد الإلكتروني: {adminCredentials.email}</p>
              <p>كلمة المرور: {adminCredentials.password}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 bg-white text-violet-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جارِ التحقق...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;