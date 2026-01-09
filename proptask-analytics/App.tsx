import React, { useState, useEffect } from 'react';
import { Plus, Building2, ListTodo, FilterX, Lock } from 'lucide-react';
import { MaintenanceTask, TaskStatus, TaskPriority } from './types';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { DashboardStats } from './components/DashboardStats';
import { TaskDetailModal } from './components/TaskDetailModal';
import { subscribeToTasks, addTask, updateTaskStatus, deleteTask } from './services/taskService';

export type TaskFilter = 'ALL' | 'NEW' | 'PROGRESS' | 'COMPLETED' | 'CRITICAL';

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

function App() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [view, setView] = useState<'dashboard' | 'new'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (!APP_PASSWORD) return true;
    return sessionStorage.getItem('proptask_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      sessionStorage.setItem('proptask_auth', 'true');
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Proptask</h1>
          <p className="text-slate-500 text-center mb-6">Skriv inn passord for å fortsette</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              placeholder="Passord"
              className={`w-full px-4 py-3 rounded-xl border ${passwordError ? 'border-red-400 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4`}
              autoFocus
            />
            {passwordError && <p className="text-red-500 text-sm mb-4">Feil passord</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Logg inn
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  useEffect(() => {
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, []);

  // Filtreringslogikk for de 5 gjenværende kategoriene
  const filteredTasks = tasks.filter(task => {
    switch (activeFilter) {
      case 'COMPLETED': return task.status === TaskStatus.COMPLETED;
      case 'NEW': return task.status === TaskStatus.PENDING;
      case 'PROGRESS': return task.status === TaskStatus.IN_PROGRESS;
      case 'CRITICAL': return (task.priority === TaskPriority.HIGH || task.priority === TaskPriority.CRITICAL) && task.status !== TaskStatus.COMPLETED;
      case 'ALL':
      default: return true;
    }
  });

  const handleCreateTask = async (newTask: MaintenanceTask) => {
    try {
      await addTask(newTask);
      setView('dashboard');
      setActiveFilter('ALL');
    } catch (error) {
      console.error("Feil ved lagring av oppgave:", error);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(id, status);
    } catch (error) {
      console.error("Feil ved oppdatering:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne oppgaven?')) {
      try {
        await deleteTask(id);
        if (selectedTaskId === id) setSelectedTaskId(null);
      } catch (error) {
        console.error("Feil ved sletting:", error);
      }
    }
  };

  const resetFilters = () => {
    setActiveFilter('ALL');
    setView('dashboard');
    setSelectedTaskId(null);
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'NEW': return 'Nye oppgaver';
      case 'PROGRESS': return 'Oppgaver under arbeid';
      case 'COMPLETED': return 'Utførte oppgaver';
      case 'CRITICAL': return 'Kritiske oppgaver';
      default: return 'Alle oppgaver';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetFilters}>
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-100 shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Proptask</h1>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Management</span>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2">
            <button 
              onClick={resetFilters}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${view === 'dashboard' && activeFilter === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Oversikt
            </button>
             <button 
              onClick={() => { setView('new'); setSelectedTaskId(null); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${view === 'new' ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'}`}
            >
              <Plus className="w-4 h-4" /> Ny Oppgave
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'dashboard' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Vedlikeholdsoversikt</h2>
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm font-medium">
                {new Date().toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <DashboardStats 
              tasks={tasks} 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-500" />
                {getFilterTitle()}
                <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                  {filteredTasks.length}
                </span>
              </h3>
              {activeFilter !== 'ALL' && (
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <FilterX className="w-3 h-3" /> Nullstill filter
                </button>
              )}
            </div>

            <TaskList 
              tasks={filteredTasks} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
              onSelect={(task) => setSelectedTaskId(task.id)}
            />
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <TaskForm 
              onTaskCreated={handleCreateTask} 
              onCancel={() => setView('dashboard')} 
            />
          </div>
        )}
      </main>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {view === 'dashboard' && !selectedTask && (
        <button
          onClick={() => setView('new')}
          className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 transition-transform active:scale-95 z-30"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}

export default App;