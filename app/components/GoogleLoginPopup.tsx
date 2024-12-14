import { FcGoogle } from 'react-icons/fc';
import { getAuth } from 'firebase/auth';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase/firebaseConfig';

interface GoogleLoginPopupProps {
  onSuccess: () => void;
}

export default function GoogleLoginPopup({ onSuccess }: GoogleLoginPopupProps) {
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth();
      const provider = googleProvider;
      
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        onSuccess();
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google login error:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[201]">
      <div 
        className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="text-2xl font-bold text-center mb-6">
          Logga in för att fortsätta
        </div>
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 border flex justify-center items-center gap-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition duration-150 shadow-sm"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Fortsätt med Google</span>
          </button>
        </div>
      </div>
    </div>
  );
} 