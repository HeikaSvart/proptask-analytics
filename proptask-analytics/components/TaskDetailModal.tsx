import React, { useState } from 'react';
import { MaintenanceTask, TaskStatus, TaskPriority } from '../types';
import { X, Calendar, MapPin, Building, CheckCircle2, Clock, Trash2, AlertTriangle, ExternalLink, MessageSquare } from 'lucide-react';

interface TaskDetailModalProps {
  task: MaintenanceTask;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus, comment?: string) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onStatusChange, onDelete }) => {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [comment, setComment] = useState('');

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleStatusClick = (status: TaskStatus) => {
    setPendingStatus(status);
    setComment('');
    setShowCommentDialog(true);
  };

  const handleConfirmStatus = () => {
    if (pendingStatus) {
      onStatusChange(task.id, pendingStatus, comment);
      setShowCommentDialog(false);
      setComment('');
      // Hvis oppgaven settes til utført, lukker vi modalen automatisk
      if (pendingStatus === TaskStatus.COMPLETED) {
        setTimeout(() => onClose(), 100);
      }
      setPendingStatus(null);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return 'Venter';
      case TaskStatus.IN_PROGRESS: return 'Pågår';
      case TaskStatus.COMPLETED: return 'Utført';
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
                  onClick={() => handleStatusClick(TaskStatus.PENDING)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.PENDING ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <AlertTriangle className="w-4 h-4" /> Venter
                </button>
                <button
                  onClick={() => handleStatusClick(TaskStatus.IN_PROGRESS)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Clock className="w-4 h-4" /> Pågår
                </button>
                <button
                  onClick={() => handleStatusClick(TaskStatus.COMPLETED)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Utført
                </button>
              </div>

              {/* Kommentarlogg */}
              {task.statusComments && task.statusComments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Kommentarlogg
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {[...task.statusComments].reverse().map((sc) => (
                      <div key={sc.id} className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            sc.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                            sc.status === TaskStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {getStatusLabel(sc.status)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(sc.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{sc.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

        {/* Kommentar-dialog */}
        {showCommentDialog && pendingStatus && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Endre status til "{getStatusLabel(pendingStatus)}"
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Legg til en valgfri kommentar for denne statusendringen.
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv en kommentar (valgfritt)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowCommentDialog(false); setPendingStatus(null); setComment(''); }}
                  className="flex-1 py-2 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleConfirmStatus}
                  className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  Bekreft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};