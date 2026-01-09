import React from 'react';
import { MaintenanceTask, TaskStatus, TaskPriority } from '../types';
import { Check, Clock, AlertTriangle, MapPin, Building, Trash2, ImageIcon } from 'lucide-react';

interface TaskListProps {
  tasks: MaintenanceTask[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSelect: (task: MaintenanceTask) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onStatusChange, onDelete, onSelect }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
          <Check className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-800">Alt ser bra ut!</h3>
        <p className="text-slate-500 mt-1">Ingen vaktmesteroppgaver er registrert.</p>
      </div>
    );
  }

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case TaskStatus.COMPLETED: 
        return <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700"><Check className="w-3 h-3" /> Utført</span>;
      case TaskStatus.IN_PROGRESS: 
        return <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> Pågår</span>;
      default: 
        return <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Venter</span>;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          onClick={() => onSelect(task)}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all hover:shadow-md cursor-pointer group relative"
        >
          <div className="flex gap-4">
            {/* Image Thumbnail */}
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-100">
              {task.imageUrl ? (
                <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority === TaskPriority.CRITICAL ? 'Kritisk' : task.priority === TaskPriority.HIGH ? 'Høy' : task.priority === TaskPriority.MEDIUM ? 'Medium' : 'Lav'}
                  </span>
                  {getStatusBadge(task.status)}
                </div>
                <div className="text-xs text-slate-400">
                   {new Date(task.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-800 truncate leading-tight mb-1">{task.title}</h3>
              
              <div className="flex flex-col gap-1 mb-2">
                {task.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                      {task.address}
                    </div>
                )}
                {task.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {task.location}
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-500 line-clamp-1 mb-2">{task.description}</p>
            </div>
          </div>
          
          {/* Action Button - Stop propagation to prevent opening modal when clicking delete */}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm"
            title="Slett oppgave"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};