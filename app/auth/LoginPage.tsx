import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Chrome, ArrowRight, Github } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <div className="h-full w-full bg-white flex flex-col p-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2 opacity-60" />

        <div className="flex-1 flex flex-col justify-center relative z-10 max-w-sm mx-auto w-full">
            <div className="mb-8">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg shadow-blue-500/20">
                    N
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-gray-500 text-lg">Sign in to continue to News Club.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <Input 
                    type="email" 
                    placeholder="Email Address" 
                    icon={<Mail size={20} />} 
                    className="bg-gray-50 border-gray-200 py-3.5"
                />
                <div>
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        icon={<Lock size={20} />} 
                        className="bg-gray-50 border-gray-200 py-3.5"
                    />
                    <div className="flex justify-end mt-2">
                        <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot Password?</button>
                    </div>
                </div>
                
                <Button fullWidth size="lg" type="submit" rightIcon={<ArrowRight size={20} />} className="rounded-xl py-3.5 font-bold shadow-xl shadow-blue-500/20 mt-2">
                    Sign In
                </Button>
            </form>

            <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <span className="relative bg-white px-4 text-sm text-gray-400 font-medium uppercase tracking-wider">Or continue with</span>
            </div>

            <div className="space-y-3">
                 <Button fullWidth variant="secondary" className="justify-center border-gray-200 py-3 text-gray-600 font-semibold" onClick={() => navigate('/onboarding')}>
                    <Chrome size={20} className="mr-2" /> Google
                 </Button>
                 <Button fullWidth variant="ghost" className="text-gray-500 font-medium" onClick={() => navigate('/onboarding')}>
                    Continue as Guest
                 </Button>
            </div>
        </div>
        
        <div className="text-center mt-4">
            <p className="text-sm text-gray-400">Don't have an account? <button className="text-blue-600 font-bold" onClick={() => navigate('/onboarding')}>Sign Up</button></p>
        </div>
    </div>
  );
};

export default LoginPage;