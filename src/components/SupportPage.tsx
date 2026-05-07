import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';

export const SupportPage: React.FC = () => {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchTickets();
    }
  }, [profile?.uid]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/support/my-tickets?uid=${profile?.uid}`);
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || isSubmitting) return;
    
    if (!profile?.uid) {
      alert("Please wait for your profile to load or try logging in again.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: profile?.uid,
          email: profile?.email,
          subject,
          message
        })
      });
      
      if (res.ok) {
        setSubject('');
        setMessage('');
        fetchTickets();
        alert('Ticket submitted successfully!');
      }
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      alert('Failed to submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <HelpCircle className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Create a ticket to get help from our support team.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">New Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
                {isSubmitting ? 'Sending...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Your Tickets</h2>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>You haven't opened any support tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white">{ticket.subject}</h3>
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase",
                        ticket.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {ticket.status === 'open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{ticket.message}</p>
                    
                    {ticket.reply && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-l-4 border-blue-500">
                        <p className="text-xs font-bold text-blue-600 mb-1">Admin Reply:</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{ticket.reply}</p>
                      </div>
                    )}
                    <div className="mt-4 text-xs text-gray-400">
                      {new Date(ticket.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
