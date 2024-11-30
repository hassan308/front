import { useState, useEffect } from 'react';
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
import { Textarea } from '../../components/ui/textarea';
import { auth } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Award, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string;
  experience: string;
  education: string;
  certifications: string;
  lastUpdated: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const [userData, setUserData] = useState<UserData>({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    lastUpdated: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      if (auth.currentUser) {
        const cachedData = localStorage.getItem('userData');
        const now = Date.now();

        if (cachedData) {
          const parsedData: UserData = JSON.parse(cachedData);
          setUserData(parsedData);
          setIsLoading(false);
          return;
        } else {
          // Initialize with current user data if no cache exists
          const newUserData = {
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email || '',
            phone: '',
            location: '',
            bio: '',
            skills: '',
            experience: '',
            education: '',
            certifications: '',
            lastUpdated: now,
          };
          setUserData(newUserData);
          localStorage.setItem('userData', JSON.stringify(newUserData));
        }

        // Commented out Firebase fetch
        /*
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const firebaseData = userDoc.data() as Omit<UserData, 'lastUpdated'>;
            const newUserData = {
              ...firebaseData,
              displayName: auth.currentUser.displayName || '',
              email: auth.currentUser.email || '',
              lastUpdated: now,
            };
            setUserData(newUserData);
            localStorage.setItem('userData', JSON.stringify(newUserData));
          } else {
            // If no document exists, initialize with current user data
            const newUserData = {
              displayName: auth.currentUser.displayName || '',
              email: auth.currentUser.email || '',
              phone: '',
              location: '',
              bio: '',
              skills: '',
              experience: '',
              education: '',
              certifications: '',
              lastUpdated: now,
            };
            setUserData(newUserData);
            localStorage.setItem('userData', JSON.stringify(newUserData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data. Please try again.');
        }
        */
      }
      setIsLoading(false);
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth.currentUser) {
      setError('Du måste vara inloggad för att uppdatera din profil.');
      return;
    }

    try {
      // Update only displayName in Firebase auth
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
      });

      // Comment out Firebase storage
      /*
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...userData,
        lastUpdated: Date.now(),
      }, { merge: true });
      */

      // Save to localStorage only
      const updatedUserData = { ...userData, lastUpdated: Date.now() };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      onClose();
    } catch (error) {
      setError('Det gick inte att uppdatera profilen. Försök igen.');
      console.error('Profile update error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-0">
        <div className="px-6 py-6 bg-gradient-to-br from-blue-400/90 to-blue-500/90">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">Din profil</DialogTitle>
            <DialogDescription className="text-base sm:text-lg text-blue-50">
              Uppdatera din profilinformation för att skapa ett imponerande CV.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="p-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Namn
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={userData.displayName}
                  onChange={handleInputChange}
                  placeholder="Ditt fullständiga namn"
                  className="w-full transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" /> E-post
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="Din e-postadress"
                  className="w-full bg-gray-50/50"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" /> Telefon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  placeholder="Ditt telefonnummer"
                  className="w-full transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" /> Plats
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={userData.location}
                  onChange={handleInputChange}
                  placeholder="Din stad eller region"
                  className="w-full transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Sammanfattning</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  placeholder="Kort sammanfattning om dig själv"
                  rows={3}
                  className="w-full resize-none transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" /> Färdigheter
                </Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={userData.skills}
                  onChange={handleInputChange}
                  placeholder="Lista dina viktigaste färdigheter"
                  rows={3}
                  className="w-full resize-none transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Arbetslivserfarenhet
                </Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={userData.experience}
                  onChange={handleInputChange}
                  placeholder="Beskriv din relevanta arbetslivserfarenhet"
                  rows={4}
                  className="w-full resize-none transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" /> Utbildning
                </Label>
                <Textarea
                  id="education"
                  name="education"
                  value={userData.education}
                  onChange={handleInputChange}
                  placeholder="Lista din utbildningsbakgrund"
                  rows={3}
                  className="w-full resize-none transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" /> Certifieringar
                </Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  value={userData.certifications}
                  onChange={handleInputChange}
                  placeholder="Lista relevanta certifieringar"
                  rows={3}
                  className="w-full resize-none transition-shadow focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="sticky bottom-0 pt-6 mt-6 border-t bg-white">
              <Button 
                type="submit" 
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium py-2.5"
              >
                Spara profil
              </Button>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-red-500 text-sm text-center mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </motion.form>
        )}
      </DialogContent>
    </Dialog>
  );
}