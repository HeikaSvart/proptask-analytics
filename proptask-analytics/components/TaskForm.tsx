import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Sparkles, AlertCircle, Building, MapPin, MapPinCheck } from 'lucide-react';
import { analyzeMaintenanceImage } from '../services/geminiService';
import { MaintenanceTask, TaskPriority, TaskStatus } from '../types';
import { uploadTaskImage } from '../services/storage';

interface TaskFormProps {
  onTaskCreated: (task: MaintenanceTask) => Promise<void> | void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setError("Bildet er for stort. Maks 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setFile(f);
      setError(null);
      await performAnalysis(f, base64);
    };
    reader.readAsDataURL(f);
  };

  const performAnalysis = async (file: File | null, base64Img?: string) => {
    setIsAnalyzing(true);
    try {
      const payload = file ?? (base64Img || "");
      const result = await analyzeMaintenanceImage(payload);
      setTitle(result.title);
      setDescription(result.description + (result.suggestedAction ? `\n\nForslag: ${result.suggestedAction}` : ''));
      setPriority(result.priority);
    } catch (err) {
      setError("Kunne ikke analysere bildet. Du kan fylle inn detaljene manuelt.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokalisering støttes ikke av din nettleser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("Kunne ikke hente posisjonen din. Sjekk tillatelser.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);

    let imageUrl: string | undefined = undefined;
    if (file) {
      try {
        console.log('Laster opp bilde til Storage...');
        imageUrl = await uploadTaskImage(file);
        console.log('Bilde lastet opp:', imageUrl);
      } catch (uploadErr) {
        console.error('Feil ved opplasting:', uploadErr);
        setError('Kunne ikke laste opp bildet. Prøv igjen.');
        setIsSubmitting(false);
        return;
      }
    }

    const newTask: MaintenanceTask = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      status: TaskStatus.PENDING,
      imageUrl,
      createdAt: Date.now(),
      location,
      address,
      coordinates
    };

    try {
      console.log('Sender til Firestore...');
      await onTaskCreated(newTask);
      console.log('Lagret!');
    } catch (error) {
      console.error('Feil ved lagring:', error);
      setIsSubmitting(false);
    }
  };

  const isLoading = isAnalyzing || isSubmitting || isGettingLocation;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Ny Vaktmesteroppgave
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group h-48"
          >
            <div className="bg-indigo-100 p-4 rounded-full mb-3 group-hover:bg-indigo-200 transition-colors">
              <Camera className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-slate-600 font-medium">Ta bilde eller last opp</p>
            <p className="text-slate-400 text-sm mt-1">AI vil analysere problemet automatisk</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-6">
            <img src={image} alt="Preview" className="w-full h-64 object-cover" />
            <button 
              type="button"
              onClick={() => { setImage(null); setTitle(''); setDescription(''); }}
              className="absolute top-2 right-2 bg-white/90 text-slate-700 p-2 rounded-full shadow-sm hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="font-medium">Analyserer med Gemini AI...</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tittel</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAnalyzing ? "Venter på AI..." : "Eks: Ødelagt lys i gangen"}
              className="w-full rounded-lg border-slate-200 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse / Bygg</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Eks: Storgata 12, Bygg A"
                  className="w-full rounded-lg border-slate-200 border p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posisjon (valgfritt)</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all font-medium text-sm
                  ${coordinates 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : coordinates ? (
                  <MapPinCheck className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isGettingLocation ? 'Henter...' : coordinates ? 'Posisjon lagret' : 'Hent min posisjon'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioritet</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border-slate-200 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value={TaskPriority.LOW}>Lav</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>Høy</option>
                <option value={TaskPriority.CRITICAL}>Kritisk</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rom / Sted (valgfritt)</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Eks: 2. etasje, rom 204"
                className="w-full rounded-lg border-slate-200 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivelse</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAnalyzing ? "Venter på AI..." : "Beskriv problemet nærmere..."}
              rows={4}
              className="w-full rounded-lg border-slate-200 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              type="button" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Avbryt
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !title}
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium shadow-sm flex justify-center items-center gap-2 transition-all
                ${isLoading || !title ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              {isLoading && !isGettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {isAnalyzing ? 'Analyserer...' : isSubmitting ? 'Sender inn...' : 'Send Inn Oppgave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
