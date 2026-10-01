import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2">
          About FarmGrade
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
          Right Price. Right Buyer. Right Time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-2 border-stone-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            Fair Price Discovery for Farmers
          </h2>
          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
            Smallholder farmers often sell perishable produce without knowing current market prices or having access to multiple buyers.
          </p>
          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
            FarmGrade connects farmers directly with verified wholesale and retail buyers, providing live mandi benchmarks and transparent quality grading.
          </p>
        </Card>

        <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-300">
              Core Principles
            </h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <span><strong>Right Price:</strong> Live mandi benchmarks and fair price ranges.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <span><strong>Right Buyer:</strong> Direct bids from verified businesses.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <span><strong>Right Time:</strong> Scheduled farm-gate pickup and instant UPI payout.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Village Kiosk Support
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 font-semibold">
              Accessible for every farmer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-stone-800">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="font-bold text-sm mb-1 text-emerald-900">Assisted Entry</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Local kiosk operators help farmers list produce and record quality grades.
            </p>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="font-bold text-sm mb-1 text-emerald-900">Digital Weighing</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Certified digital scales generate verified weighment slips for every sale.
            </p>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="font-bold text-sm mb-1 text-emerald-900">Voice Support</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tamil, Hindi, and English voice input makes listing simple and fast.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-2">
        <Link to="/farmer/dashboard">
          <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
            Open Farmer Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
