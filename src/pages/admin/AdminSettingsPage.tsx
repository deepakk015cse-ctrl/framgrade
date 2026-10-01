import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import {
  Settings,
  ShieldCheck,
  Save,
  LogOut
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { addToast, requestLogout } = useApp();
  const navigate = useNavigate();

  const [kioskName, setKioskName] = useState('Oddanchatram Village Kiosk');
  const [district, setDistrict] = useState('Dindigul');
  const [helplineNumber, setHelplineNumber] = useState('1800-425-3276');
  const [syncInterval, setSyncInterval] = useState('15');
  const [autoSmsAlerts, setAutoSmsAlerts] = useState(true);
  const [priceTolerance, setPriceTolerance] = useState('10');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings saved successfully.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Reports & Settings
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Configure kiosk details, market price sync, and SMS notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            requestLogout(() => {
              navigate('/login', { replace: true });
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-sm min-h-[44px] cursor-pointer transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Logout</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Kiosk Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Kiosk Name
              </label>
              <input
                type="text"
                value={kioskName}
                onChange={(e) => setKioskName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Helpline Number
              </label>
              <input
                type="text"
                value={helplineNumber}
                onChange={(e) => setHelplineNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Market Price Sync Interval
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold min-h-[44px] bg-white"
              >
                <option value="5">Every 5 Minutes</option>
                <option value="15">Every 15 Minutes</option>
                <option value="30">Every 30 Minutes</option>
                <option value="60">Every Hour</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>Notification & Price Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase block">SMS Notifications</span>
                <span className="text-sm font-bold text-stone-900">
                  Notify farmer when buyer confirms
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSmsAlerts(!autoSmsAlerts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black min-h-[44px] cursor-pointer transition-colors ${
                  autoSmsAlerts ? 'bg-emerald-700 text-white' : 'bg-stone-300 text-stone-800'
                }`}
              >
                {autoSmsAlerts ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Fair Price Range Tolerance (±%)
              </label>
              <input
                type="number"
                value={priceTolerance}
                onChange={(e) => setPriceTolerance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold min-h-[44px]"
                min="1"
                max="25"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
