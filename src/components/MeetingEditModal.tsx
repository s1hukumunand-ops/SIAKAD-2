import React, { useState, useEffect } from 'react';
import { MeetingInfo } from '../types';
import { Calendar, X, Save } from 'lucide-react';

interface MeetingEditModalProps {
  isOpen: boolean;
  meeting: MeetingInfo | null;
  onClose: () => void;
  onSave: (meeting: MeetingInfo) => void;
}

export const MeetingEditModal: React.FC<MeetingEditModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'Tatap Muka' | 'Daring' | 'Hybrid'>('Tatap Muka');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (meeting) {
      setDate(meeting.date || '');
      setTopic(meeting.topic || '');
      setMode(meeting.mode || 'Tatap Muka');
      setNotes(meeting.notes || '');
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...meeting,
      date,
      topic,
      mode,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Edit Pertemuan ke-{meeting.meetingNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Metode / Mode Perkuliahan
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tatap Muka">Tatap Muka (Luring di Kelas)</option>
              <option value="Daring">Daring (Online Zoom / GMeet)</option>
              <option value="Hybrid">Hybrid (Kombinasi)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pokok Bahasan / Topik Materi Kuliah
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Hukum Acara Mahkamah Konstitusi & Pengujian UU (Judicial Review)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus Pertemuan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dosen tamu hadir, mahasiswa kumpul makalah"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
