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
import { auth, db } from '../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
          if (now - parsedData.lastUpdated < CACHE_DURATION) {
            setUserData(parsedData);
            setIsLoading(false);
            return;
          }
        }

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
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
      });

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...userData,
        lastUpdated: Date.now(),
      }, { merge: true });

      localStorage.setItem('userData', JSON.stringify({...userData, lastUpdated: Date.now()}));

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
      <DialogContent className="sm:max-w-[700px] bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-blue-700">Din profil</DialogTitle>
          <DialogDescription className="text-lg text-blue-500 mt-2">
            Uppdatera din profilinformation för att skapa ett imponerande CV.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="mt-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-blue-600 font-semibold flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" /> Namn
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={userData.displayName}
                  onChange={handleInputChange}
                  placeholder="Ditt fullständiga namn"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600 font-semibold flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> E-post
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="Din e-postadress"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600 font-semibold flex items-center">
                  <Phone className="w-4 h-4 mr-2" /> Telefon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  placeholder="Ditt telefonnummer"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-blue-600 font-semibold flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Plats
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={userData.location}
                  onChange={handleInputChange}
                  placeholder="Din stad eller region"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-blue-600 font-semibold">Sammanfattning</Label>
              <Textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                placeholder="Kort sammanfattning om dig själv"
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-blue-600 font-semibold flex items-center">
                <Award className="w-4 h-4 mr-2" /> Färdigheter
              </Label>
              <Textarea
                id="skills"
                name="skills"
                value={userData.skills}
                onChange={handleInputChange}
                placeholder="Lista dina viktigaste färdigheter"
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-blue-600 font-semibold flex items-center">
                <Briefcase className="w-4 h-4 mr-2" /> Arbetslivserfarenhet
              </Label>
              <Textarea
                id="experience"
                name="experience"
                value={userData.experience}
                onChange={handleInputChange}
                placeholder="Beskriv din relevanta arbetslivserfarenhet"
                rows={4}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education" className="text-blue-600 font-semibold flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" /> Utbildning
              </Label>
              <Textarea
                id="education"
                name="education"
                value={userData.education}
                onChange={handleInputChange}
                placeholder="Lista din utbildningsbakgrund"
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-blue-600 font-semibold flex items-center">
                <Award className="w-4 h-4 mr-2" /> Certifieringar
              </Label>
              <Textarea
                id="certifications"
                name="certifications"
                value={userData.certifications}
                onChange={handleInputChange}
                placeholder="Lista relevanta certifieringar"
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition duration-300">
              Spara profil
            </Button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </motion.form>
        )}
      </DialogContent>
    </Dialog>
  );
}