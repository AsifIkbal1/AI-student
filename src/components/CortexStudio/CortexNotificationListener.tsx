import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../AuthContext";
import { Bell, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export const CortexNotificationListener: React.FC = () => {
  const { profile } = useAuth();
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    if (!profile || !db) return;

    // Request browser notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const q = query(
      collection(db, "cortex_notifications"),
      where("userId", "==", profile.uid),
      where("read", "==", false),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          setNotification({ id: change.doc.id, ...data });
          
          // Show Browser Notification
          if (Notification.permission === "granted") {
            new Notification(data.title, {
              body: data.message,
              icon: "/favicon.ico"
            });
          }

          // Auto-hide after 10 seconds
          setTimeout(() => setNotification(null), 10000);
        }
      });
    });

    return () => unsubscribe();
  }, [profile]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className="w-96 p-6 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 border border-white/20 backdrop-blur-md relative"
        >
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>

          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-white/10 shrink-0">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div className="space-y-1 pr-6">
              <h4 className="font-black text-sm uppercase tracking-widest opacity-70">Agent Reminder</h4>
              <p className="font-bold text-lg leading-tight">{notification.title}</p>
              <p className="text-sm opacity-90 font-medium">{notification.message}</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
