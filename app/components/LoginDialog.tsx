import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Logga in
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full py-2 px-4 border flex justify-center items-center gap-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition duration-150 shadow-sm"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Fortsätt med Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}