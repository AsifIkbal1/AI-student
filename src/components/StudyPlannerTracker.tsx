import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Calendar, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface Task {
  id: string;
  uid: string;
  title: string;
  subject: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

export const StudyPlannerTracker: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", subject: "", deadline: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "tasks"),
      where("uid", "==", profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const taskList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline || !profile) return;

    setAdding(true);
    try {
      await addDoc(collection(db, "tasks"), {
        uid: profile.uid,
        title: newTask.title,
        subject: newTask.subject || "General",
        deadline: newTask.deadline,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setNewTask({ title: "", subject: "", deadline: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), { completed: !completed });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error(error);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Add Task & Progress */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="text-blue-600" size={20} /> Add New Task
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Subject (Optional)"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Add Task
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Progress</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {completedCount}/{tasks.length} Tasks
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
            <span className="text-sm text-gray-500">{tasks.length} total</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="bg-gray-50 p-6 rounded-full w-fit mx-auto mb-4">
                <CheckSquare size={48} className="text-gray-300" />
              </div>
              <p className="text-gray-500">No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={task.id}
                    className={cn(
                      "group bg-white p-4 rounded-2xl border transition-all flex items-center gap-4",
                      task.completed ? "border-emerald-100 bg-emerald-50/30" : "border-gray-100 hover:border-blue-200"
                    )}
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={cn(
                        "transition-colors",
                        task.completed ? "text-emerald-600" : "text-gray-300 hover:text-blue-500"
                      )}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-bold text-gray-900 truncate",
                        task.completed && "line-through text-gray-400"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {task.subject}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> {format(new Date(task.deadline), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
