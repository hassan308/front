import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { HiMail } from 'react-icons/hi';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      setError('Det gick inte att logga in med Google. Försök igen.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      console.error('Email login/register error:', error);
      setError('Fel vid inloggning/registrering. Kontrollera dina uppgifter och försök igen.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Ett återställningsmail har skickats till din e-postadress.');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Det gick inte att skicka återställningsmail. Kontrollera e-postadressen och försök igen.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            {isForgotPassword ? 'Återställ lösenord' : isRegistering ? 'Registrera' : 'Logga in'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isForgotPassword && (
            <>
              <Button 
                onClick={handleGoogleLogin} 
                className="w-full py-2 px-4 border flex justify-center items-center gap-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition duration-150 shadow-sm"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Fortsätt med Google</span>
              </Button>
              <div className="flex items-center justify-between">
                <hr className="w-full border-t border-gray-300" />
                <span className="px-2 text-gray-500 bg-white text-sm">eller</span>
                <hr className="w-full border-t border-gray-300" />
              </div>
            </>
          )}
          <form onSubmit={isForgotPassword ? handleForgotPassword : handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-post</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="din@email.com"
              />
            </div>
            {!isForgotPassword && (
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Lösenord</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-150 shadow-sm">
              <HiMail className="w-5 h-5" />
              <span>{isForgotPassword ? 'Skicka återställningsmail' : isRegistering ? 'Registrera' : 'Logga in'}</span>
            </Button>
          </form>
          {!isForgotPassword ? (
            <>
              <p className="text-center text-sm">
                {isRegistering ? 'Har du redan ett konto?' : 'Har du inget konto?'}
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-1 text-blue-600 hover:underline focus:outline-none"
                >
                  {isRegistering ? 'Logga in' : 'Registrera dig'}
                </button>
              </p>
              <p className="text-center text-sm">
                <button
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Glömt lösenord?
                </button>
              </p>
            </>
          ) : (
            <p className="text-center text-sm">
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Tillbaka till inloggning
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}