import React, { useState } from 'react';
import { Layers, Lock, Mail, AlertCircle, Eye, EyeOff, Sparkles, User, Shield, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Engineer, AppUser } from '../types';

interface LoginProps {
  engineers: Engineer[];
  onLoginSuccess: (user: AppUser, isDemo: boolean) => void;
}

export default function Login({ engineers, onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<'admin' | 'engineer'>('admin');
  const [demoEngineerId, setDemoEngineerId] = useState(engineers[0]?.id || 'ENG-001');

  const cleanEmail = (emailStr: string) => emailStr.trim().toLowerCase();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = cleanEmail(email);

    if (!targetEmail || !password) {
      setError('Por favor, complete todos los campos.');
      setLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    // Role detection by email
    let role: 'admin' | 'engineer' = 'engineer';
    let matchedEngineer: Engineer | undefined;

    if (targetEmail === 'alexis.guerra@orimec.com.ec') {
      role = 'admin';
    } else {
      matchedEngineer = engineers.find(eng => cleanEmail(eng.email) === targetEmail);
      if (!matchedEngineer) {
        setError('El correo electrónico no está registrado en el listado de técnicos autorizados. Contacte al administrador.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        // Register in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
        const firebaseUser = userCredential.user;

        // Store role profile in Firestore
        const userProfile: AppUser = {
          uid: firebaseUser.uid,
          email: targetEmail,
          role,
          ...(role === 'engineer' && { engineerId: matchedEngineer?.id })
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
        onLoginSuccess(userProfile, false);
      } else {
        // Sign In via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
        const firebaseUser = userCredential.user;

        // Fetch profile
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          onLoginSuccess(userDoc.data() as AppUser, false);
        } else {
          // If auth worked but firestore profile doesn't exist, create it dynamically
          const userProfile: AppUser = {
            uid: firebaseUser.uid,
            email: targetEmail,
            role,
            ...(role === 'engineer' && { engineerId: matchedEngineer?.id })
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
          onLoginSuccess(userProfile, false);
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let errMsg = 'Ocurrió un error en el servidor de autenticación.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este correo ya está registrado en la plataforma.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Credenciales incorrectas. Verifique su correo y contraseña.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Formato de correo electrónico no válido.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      let mockEmail = 'alexis.guerra@orimec.com.ec';
      let mockEngId: string | undefined;

      if (demoRole === 'engineer') {
        const eng = engineers.find(e => e.id === demoEngineerId);
        mockEmail = eng?.email || 'ingeniero@orimec.com';
        mockEngId = demoEngineerId;
      }

      const mockUser: AppUser = {
        uid: `demo-uid-${demoRole}-${Date.now()}`,
        email: mockEmail,
        role: demoRole,
        engineerId: mockEngId
      };

      onLoginSuccess(mockUser, true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-850/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl p-8 relative z-10">
        
        {/* Branding Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-650 to-indigo-500 text-white p-3 rounded-2xl shadow-lg shadow-indigo-650/20 mb-4 animate-bounce-slow">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Gestión Técnica</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isDemoMode ? 'Simulador de Acceso Local (Pruebas)' : 'Portal de Soporte y Control de Servicios'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-rose-900/30 border border-rose-800/50 rounded-2xl flex gap-3 text-rose-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="text-2xs font-semibold leading-normal">{error}</span>
          </div>
        )}

        {/* Demo Mode or Firebase Mode Selector tab */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/40 mb-6">
          <button
            onClick={() => { setIsDemoMode(false); setError(null); }}
            className={`flex-1 text-center py-2 text-3xs font-extrabold rounded-lg transition-all ${
              !isDemoMode 
                ? 'bg-indigo-650 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Firebase Auth Cloud
          </button>
          <button
            onClick={() => { setIsDemoMode(true); setError(null); }}
            className={`flex-1 text-center py-2 text-3xs font-extrabold rounded-lg transition-all ${
              isDemoMode 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Local (Offline)
          </button>
        </div>

        {/* Forms Container */}
        {!isDemoMode ? (
          /* Firebase Auth Mode Form */
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="ej: alexis.guerra@orimec.com.ec"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-800/55 border border-slate-700 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-800/55 border border-slate-700 text-white text-xs pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Confirmar Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-800/55 border border-slate-700 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-850 text-white font-bold py-3 px-4 rounded-xl text-2xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Form Toggle Link */}
            <p className="text-center text-3xs text-slate-400 font-semibold mt-4">
              {isSignUp ? '¿Ya tiene cuenta?' : '¿Es nuevo en el sistema?'}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? 'Inicie Sesión aquí' : 'Regístrese aquí'}
              </button>
            </p>

            {/* Admin Auto-register Info Banner */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 text-[9px] text-slate-400 leading-normal flex gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong>Nota:</strong> Al registrarte como <strong>alexis.guerra@orimec.com.ec</strong> recibirás automáticamente el rol de Administrador. Si eres técnico, usa tu correo asignado en la base de datos de ingenieros.
              </p>
            </div>
          </form>
        ) : (
          /* Local Demo Mode Form */
          <form onSubmit={handleDemoLogin} className="space-y-5">
            {/* Demo Role Selector */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Rol de Prueba</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDemoRole('admin')}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border font-bold text-3xs transition-all cursor-pointer ${
                    demoRole === 'admin'
                      ? 'bg-slate-800 text-amber-500 border-amber-600/70 shadow-sm'
                      : 'bg-slate-800/40 text-slate-450 border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRole('engineer')}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border font-bold text-3xs transition-all cursor-pointer ${
                    demoRole === 'engineer'
                      ? 'bg-slate-800 text-teal-500 border-teal-600/70 shadow-sm'
                      : 'bg-slate-800/40 text-slate-450 border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ingeniero</span>
                </button>
              </div>
            </div>

            {/* Engineer Profile selector (only if engineer is chosen) */}
            {demoRole === 'engineer' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Simular como Técnico</label>
                <select
                  value={demoEngineerId}
                  onChange={e => setDemoEngineerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-semibold cursor-pointer"
                >
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Demo Notice Banner */}
            <div className="p-3 bg-amber-900/10 border border-amber-800/20 text-[9px] text-amber-300/80 rounded-xl leading-normal flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p>
                <strong>Modo Simulado:</strong> No requiere internet ni configuración en la consola. Es perfecto para probar rápidamente los flujos de vista entre Admin y Técnico.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-550 disabled:bg-amber-900 text-white font-bold py-3.5 px-4 rounded-xl text-2xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar (Prueba Local)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
