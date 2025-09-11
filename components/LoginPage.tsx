import React, { useState } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = role === 'admin';
  const adminCredentials = {
    email: 'admin@educational-platform.com',
    password: 'admin123'
  };

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
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إنشاء الحساب أولاً.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('يرجى تأكيد البريد الإلكتروني أولاً.');
        } else if (error.message.includes('Too many requests')) {
          setError('تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً.');
        } else {
          setError(`خطأ في تسجيل الدخول: ${error.message}`);
        }
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

  // Function to create test users using admin client
  const createTestUser = async (userType: 'admin' | 'student') => {
    setIsLoading(true);
    setError('');

    try {
      const testCredentials = userType === 'admin' 
        ? { email: 'admin@educational-platform.com', password: 'admin123' }
        : { email: 'ali@example.com', password: 'student123' };

      // Use admin client to create user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: testCredentials.email,
        password: testCredentials.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: userType
        }
      });

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
          setError('هذا المستخدم موجود بالفعل. يمكنك تسجيل الدخول مباشرة.');
        } else {
          setError(`خطأ في إنشاء المستخدم: ${error.message}`);
        }
      } else {
        console.log('User created successfully:', data);
        
        // Add user to public.users table
        if (data.user) {
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: userType
            });
          
          if (insertError && !insertError.message.includes('duplicate key')) {
            console.error('Error adding user to public.users:', insertError);
          }

          // If admin, add to admin_users table
          if (userType === 'admin') {
            const { error: adminError } = await supabaseAdmin
              .from('admin_users')
              .insert({
                user_id: data.user.id,
                role: 'admin'
              });
            
            if (adminError && !adminError.message.includes('duplicate key')) {
              console.error('Error adding admin user:', adminError);
            }
          }
        }
        
        setError('');
        alert(`تم إنشاء حساب ${userType === 'admin' ? 'المدرّس' : 'الطالب'} بنجاح! يمكنك الآن تسجيل الدخول.`);
        
        // Auto-fill the form with the created credentials
        setEmail(testCredentials.email);
        setPassword(testCredentials.password);
      }
    } catch (err) {
      console.error('Error creating test user:', err);
      setError('حدث خطأ أثناء إنشاء المستخدم.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">منصة التعلم التفاعلية</h1>
          <p className="text-blue-200">مرحباً بك في رحلة التعلم</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                role === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              مدرّس
            </button>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                role === 'student'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-200 hover:text-white'
              }`}
            >
              طالب
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Test User Creation Buttons */}
        <div className="mt-6 space-y-3">
          {isAdmin && (
            <div className="bg-blue-500/30 text-white p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">بيانات تسجيل الدخول للمدرّس:</p>
              <p>البريد الإلكتروني: {adminCredentials.email}</p>
              <p>كلمة المرور: {adminCredentials.password}</p>
              <button
                type="button"
                onClick={() => createTestUser('admin')}
                disabled={isLoading}
                className="mt-2 w-full p-2 bg-blue-600/50 hover:bg-blue-600/70 rounded text-sm transition-colors disabled:opacity-50"
              >
                إنشاء حساب المدرّس التجريبي
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="bg-green-500/30 text-white p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">بيانات تسجيل الدخول للطالب:</p>
              <p>البريد الإلكتروني: ali@example.com</p>
              <p>كلمة المرور: student123</p>
              <button
                type="button"
                onClick={() => createTestUser('student')}
                disabled={isLoading}
                className="mt-2 w-full p-2 bg-green-600/50 hover:bg-green-600/70 rounded text-sm transition-colors disabled:opacity-50"
              >
                إنشاء حساب الطالب التجريبي
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;