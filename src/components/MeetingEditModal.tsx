import React, { useState, useEffect } from 'react';
import { MeetingInfo } from '../types';
import { Calendar, X, Sparkles, CheckSquare } from 'lucide-react';
import { formatIndoDate, generateConsecutiveMeetingDates } from '../utils/dateUtils';

interface MeetingEditModalProps {
  isOpen: boolean;
  meeting: MeetingInfo | null;
  allMeetings?: MeetingInfo[];
  onClose: () => void;
  onSave: (meeting: MeetingInfo, updatedAllMeetings?: MeetingInfo[]) => void;
}

export const MeetingEditModal: React.FC<MeetingEditModalProps> = ({
  isOpen,
  meeting,
  allMeetings = [],
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'Tatap Muka' | 'Daring' | 'Hybrid'>('Tatap Muka');
  const [notes, setNotes] = useState('');
  const [autoShiftNext, setAutoShiftNext] = useState(true);

  useEffect(() => {
    if (meeting) {
      setDate(meeting.date || '');
      setTopic(meeting.topic || '');
      setMode(meeting.mode || 'Tatap Muka');
      setNotes(meeting.notes || '');
      // Only default auto shift if not the last meeting
      setAutoShiftNext(meeting.meetingNumber < 14);
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCurrent: MeetingInfo = {
      ...meeting,
      date,
      topic,
      mode,
      notes,
    };

    if (autoShiftNext && date && allMeetings.length > 0) {
      // Generate consecutive dates for subsequent meetings
      const remainingCount = 14 - meeting.meetingNumber + 1;
      const consecutiveDates = generateConsecutiveMeetingDates(date, remainingCount);

      const updatedAll = allMeetings.map((m) => {
        if (m.meetingNumber < meeting.meetingNumber) {
          return m;
        }
        if (m.meetingNumber === meeting.meetingNumber) {
          return updatedCurrent;
        }
        const offsetIndex = m.meetingNumber - meeting.meetingNumber;
        return {
          ...m,
          date: consecutiveDates[offsetIndex] || m.date,
        };
      });

      onSave(updatedCurrent, updatedAll);
    } else {
      onSave(updatedCurrent);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Edit Pertemuan ke-{meeting.meetingNumber}
              </h3>
              <p className="text-[11px] text-slate-500">Atur tanggal, topik materi perkuliahan, dan mode tatap muka</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Tanggal Pelaksanaan *</span>
              {date && (
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {formatIndoDate(date)}
                </span>
              )}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {meeting.meetingNumber < 14 && (
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoShiftNext}
                  onChange={(e) => setAutoShiftNext(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-blue-900 block text-xs">
                    Sesuaikan otomatis tanggal pertemuan berikutnya (P{meeting.meetingNumber + 1} s/d P14)
                  </span>
                  <span className="text-[11px] text-blue-700 block mt-0.5 leading-relaxed">
                    Setiap pertemuan berikutnya otomatis ditambah 7 hari (+1 minggu) berturut-turut.
                  </span>
                </div>
              </label>
            </div>
          )}

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
              Pokok Bahasan / Topik Silabus Perkuliahan *
            </label>
            <textarea
              rows={3}
              required
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
