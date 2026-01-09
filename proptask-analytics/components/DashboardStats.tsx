import React from 'react';
import { MaintenanceTask, TaskStatus, TaskPriority } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Activity, Inbox } from 'lucide-react';
import { TaskFilter } from '../App';

interface DashboardStatsProps {
  tasks: MaintenanceTask[];
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks, activeFilter, onFilterChange }) => {
  const total = tasks.length;
  const newTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const highPriority = tasks.filter(t => (t.priority === TaskPriority.HIGH || t.priority === TaskPriority.CRITICAL) && t.status !== TaskStatus.COMPLETED).length;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    colorClass, 
    filterType 
  }: { 
    title: string, 
    value: number, 
    icon: any, 
    colorClass: string,
    filterType: TaskFilter
  }) => {
    const isActive = activeFilter === filterType;
    
    return (
      <button 
        onClick={() => onFilterChange(isActive ? 'ALL' : filterType)}
        className={`bg-white p-4 rounded-xl shadow-sm border transition-all flex items-center space-x-3 text-left group
          ${isActive 
            ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md scale-[1.02] z-10' 
            : 'border-slate-100 hover:border-indigo-200 hover:shadow-md active:scale-95'}
        `}
      >
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all shrink-0`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{title}</p>
          <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">{value}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      <StatCard 
        title="Totalt" 
        value={total} 
        icon={Activity} 
        colorClass="bg-slate-500 text-slate-600"
        filterType="ALL"
      />
      <StatCard 
        title="Nye oppgaver" 
        value={newTasks} 
        icon={Inbox} 
        colorClass="bg-orange-500 text-orange-600"
        filterType="NEW"
      />
      <StatCard 
        title="I arbeid" 
        value={inProgress} 
        icon={Clock} 
        colorClass="bg-blue-500 text-blue-600"
        filterType="PROGRESS"
      />
      <StatCard 
        title="Utført" 
        value={completed} 
        icon={CheckCircle2} 
        colorClass="bg-emerald-500 text-emerald-600"
        filterType="COMPLETED"
      />
      <StatCard 
        title="Kritisk / Høy" 
        value={highPriority} 
        icon={AlertTriangle} 
        colorClass="bg-rose-500 text-rose-600"
        filterType="CRITICAL"
      />
    </div>
  );
};