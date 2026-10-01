import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Mic,
  Camera,
  Scale,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Add Produce',
      subtitle: 'Simple Form or Voice Input',
      icon: <Camera className="w-5 h-5" />,
      description:
        'Select your crop, enter the quantity and quality grade, and set your expected price.',
      keyTakeaway: 'Fast listing in English, Tamil, or Hindi.'
    },
    {
      step: 2,
      title: 'Market Prices',
      subtitle: 'Grade A / B / C Price Range',
      icon: <Scale className="w-5 h-5" />,
      description:
        'Check live regional mandi rates and recommended fair price ranges based on crop quality.',
      keyTakeaway: 'Know the fair market rate before selling.'
    },
    {
      step: 3,
      title: 'Buyer Offers',
      subtitle: 'Compare Verified Bids',
      icon: <DollarSign className="w-5 h-5" />,
      description:
        'Verified wholesalers and retailers place bids with clear pickup dates and payment terms.',
      keyTakeaway: 'Choose the best offer for your harvest.'
    },
    {
      step: 4,
      title: 'Sale Completed',
      subtitle: 'Weighment & Instant Payout',
      icon: <Receipt className="w-5 h-5" />,
      description:
        'Confirm the buyer, complete digital weighing at pickup, and receive direct UPI payment.',
      keyTakeaway: 'Digital receipts and immediate settlement.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2">
          How FarmGrade Works
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
          Four simple steps from listing produce to receiving payment.
        </p>
      </div>

      {/* Step Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              activeStep === s.step
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-600/40'
            }`}
          >
            <div className="text-xs font-bold opacity-80 mb-0.5">Step {s.step}</div>
            <div className="font-bold text-sm sm:text-base leading-tight truncate">
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Step Details */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs">
        {steps
          .filter((s) => s.step === activeStep)
          .map((s) => (
            <div key={s.step} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full mb-3">
                  {s.icon}
                  <span>Step {s.step}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-1">
                  {s.title}
                </h2>
                <p className="text-emerald-700 font-semibold text-sm mb-3">
                  {s.subtitle}
                </p>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-5">
                  {s.description}
                </p>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs sm:text-sm font-semibold text-stone-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>{s.keyTakeaway}</span>
                </div>
              </div>

              <div className="bg-stone-100 rounded-2xl p-5 border border-stone-200">
                {s.step === 1 && (
                  <div className="bg-white rounded-xl p-5 border border-stone-200 text-center space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-950 font-bold text-sm">
                        🍅 Tomato
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 font-bold text-sm">
                        🧅 Onion
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 font-bold text-sm">
                        🥔 Potato
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                      <Mic className="w-4 h-4 text-emerald-300" />
                      <span>Voice Input Supported</span>
                    </div>
                  </div>
                )}

                {s.step === 2 && (
                  <div className="bg-white rounded-xl p-5 border border-stone-200 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 text-sm">Quality Grade</span>
                      <StatusBadge status="Grade A" size="md" />
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-xs text-emerald-800 font-bold">Expected Price Range</div>
                      <div className="text-xl font-black text-emerald-950">₹32 – ₹37 / kg</div>
                    </div>
                  </div>
                )}

                {s.step === 3 && (
                  <div className="bg-white rounded-xl p-5 border border-stone-200 text-left space-y-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-stone-900 text-sm">FreshBasket Retail</div>
                          <div className="text-xs text-stone-500">4.8 ★ · Verified Buyer</div>
                        </div>
                        <span className="text-lg font-extrabold text-emerald-800">₹35/kg</span>
                      </div>
                      <div className="mt-2 text-xs text-stone-600">
                        Pickup: Today 4:00 PM · Immediate UPI
                      </div>
                    </div>
                  </div>
                )}

                {s.step === 4 && (
                  <div className="bg-white rounded-xl p-5 border border-stone-200 text-left space-y-2">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span>Receipt:</span>
                        <span className="font-bold">FG-SL-2026-0922</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Weighment Slip:</span>
                        <span className="font-bold">WGH-8902 (450 kg)</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-stone-200">
                        <span>Total Paid:</span>
                        <span>₹15,750</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/farmer/add-produce')}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Add Produce
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate('/buyer/market')}
        >
          Find Produce
        </Button>
      </div>
    </div>
  );
};
