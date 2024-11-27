import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

interface CoverLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coverLetterData: any) => void;
}

export default function CoverLetterDialog({ isOpen, onClose, onSubmit }: CoverLetterDialogProps) {
  const [coverLetterData, setCoverLetterData] = useState({
    introduction: '',
    body: '',
    conclusion: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(coverLetterData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-purple-700">Skapa ditt Personliga Brev</DialogTitle>
          <DialogDescription className="text-lg text-gray-600 mt-2">
            Fyll i informationen nedan för att skapa ditt personliga brev.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="introduction" className="text-gray-700">Introduktion</Label>
            <Textarea
              id="introduction"
              value={coverLetterData.introduction}
              onChange={(e) => setCoverLetterData({...coverLetterData, introduction: e.target.value})}
              className="mt-1"
              rows={4}
              placeholder="Skriv en kort introduktion om dig själv och varför du söker jobbet"
            />
          </div>
          <div>
            <Label htmlFor="body" className="text-gray-700">Huvudtext</Label>
            <Textarea
              id="body"
              value={coverLetterData.body}
              onChange={(e) => setCoverLetterData({...coverLetterData, body: e.target.value})}
              className="mt-1"
              rows={6}
              placeholder="Beskriv dina relevanta erfarenheter och färdigheter"
            />
          </div>
          <div>
            <Label htmlFor="conclusion" className="text-gray-700">Avslutning</Label>
            <Textarea
              id="conclusion"
              value={coverLetterData.conclusion}
              onChange={(e) => setCoverLetterData({...coverLetterData, conclusion: e.target.value})}
              className="mt-1"
              rows={4}
              placeholder="Skriv en avslutande mening och tacka för deras tid"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white transition duration-300 ease-in-out px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg">
              Spara Personligt Brev
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}