import React from 'react';
import { MaintenanceTask, TaskStatus, TaskPriority } from '../types';
import { X, Calendar, MapPin, Building, CheckCircle2, Clock, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

interface TaskDetailModalProps {
  task: MaintenanceTask;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onStatusChange, onDelete }) => {
  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleStatusUpdate = (status: TaskStatus) => {
    onStatusChange(task.id, status);
    // Hvis oppgaven settes til utført, lukker vi modalen automatisk
    if (status === TaskStatus.COMPLETED) {
      setTimeout(() => onClose(), 100); 
    }
  };

  const googleMapsUrl = task.coordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${task.coordinates.latitude},${task.coordinates.longitude}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Image */}
        <div className="relative h-64 md:h-80 bg-slate-900 shrink-0">
          {task.imageUrl ? (
            <img 
              src={task.imageUrl} 
              alt={task.title} 
              className="w-full h-full object-contain bg-black/50" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <span className="text-lg">Ingen bilde tilgjengelig</span>
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
             <span className={`inline-block text-xs font-bold px-2 py-1 rounded mb-2 ${getPriorityColor(task.priority)}`}>
                {task.priority} PRIORITY
              </span>
            <h2 className="text-2xl font-bold text-white leading-tight">{task.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
               <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Opprettet</label>
                <div className="flex items-center gap-2 text-slate-700 mt-1">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">
                    {new Date(task.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Adresse</label>
                <div className="flex items-center gap-2 text-slate-700 mt-1">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium truncate">{task.address || "Ikke spesifisert"}</span>
                </div>
              </div>

               <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lokasjon</label>
                <div className="flex items-center gap-2 text-slate-700 mt-1">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium truncate">{task.location || "Ikke spesifisert"}</span>
                </div>
              </div>

              {googleMapsUrl && (
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kart</label>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 mt-1 font-medium text-sm transition-colors"
                  >
                    Åpne i Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Beskrivelse av problemet</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Status & Actions */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3">Oppgavestatus</h3>
              
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => handleStatusUpdate(TaskStatus.PENDING)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.PENDING ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <AlertTriangle className="w-4 h-4" /> Venter
                </button>
                <button
                  onClick={() => handleStatusUpdate(TaskStatus.IN_PROGRESS)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Clock className="w-4 h-4" /> Pågår
                </button>
                <button
                  onClick={() => handleStatusUpdate(TaskStatus.COMPLETED)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Utført
                </button>
              </div>
            </div>

             <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Slett denne oppgaven
                </button>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};