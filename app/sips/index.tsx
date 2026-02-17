
import React, { useState } from 'react';
import SipsDashboard from './SipsDashboard';
import { Lock, ShieldAlert, BookOpen } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SipsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple client-side check for demo purposes
      if (passcode === 'teacher123') {
          setIsAuthenticated(true);
      } else {
          setError('Invalid Access Code');
      }
  };

  if (isAuthenticated) {
      return <SipsDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden font-sans">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#000000_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="relative z-10 w-full max-w-sm bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <BookOpen size={32} className="text-white" />
                </div>
            </div>
            
            <h1 className="text-2xl font-black text-center mb-2 tracking-tight">SIPS Access</h1>
            <p className="text-gray-400 text-center text-sm mb-8">Smart Interactive Presentation System</p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <Input 
                        type="password" 
                        placeholder="Enter Teacher Passcode" 
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white text-center font-mono tracking-widest focus:border-indigo-500"
                        icon={<Lock size={18} />}
                    />
                </div>
                
                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold bg-red-900/20 p-2 rounded-lg border border-red-900/50">
                        <ShieldAlert size={14} /> {error}
                    </div>
                )}

                <Button fullWidth size="lg" className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 mt-2">
                    Enter Classroom
                </Button>
            </form>
            
            <p className="text-[10px] text-gray-600 text-center mt-6">Restricted Area • Authorized Personnel Only</p>
        </div>
    </div>
  );
};

export default SipsPage;
