import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Truck,
  FileCheck2,
  UserCheck,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Button } from './Button';

export interface TimelineStep {
  step: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'cancelled';
  timestamp?: string;
  selectedBuyer?: string;
  activeBuyer?: {
    id: number;
    name: string;
    price: number;
    phone: string;
  } | null;
  cancellationsCount?: number;
  weighmentSlipNo?: string;
}

interface BiddingStatusTimelineProps {
  steps: TimelineStep[];
  currentStageIndex: number;
  cropName: string;
  onSimulateBuyerConfirm?: () => void;
  onSimulateBuyerCancel?: () => void;
  isActionLoading?: boolean;
  cancelledBidsCount?: number;
}

export const BiddingStatusTimeline: React.FC<BiddingStatusTimelineProps> = ({
  steps,
  currentStageIndex,
  cropName,
  onSimulateBuyerConfirm,
  onSimulateBuyerCancel,
  isActionLoading = false,
  cancelledBidsCount = 0,
}) => {
  return (
    <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Competitive Bidding & Settlement Timeline
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Stage {currentStageIndex + 1} of 5
            </span>
          </div>
          <p className="text-stone-500 text-xs mt-1">
            End-to-end transparent progression from produce listing to weighment slip and verified settlement.
          </p>
        </div>

        {cancelledBidsCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>{cancelledBidsCount} Buyer Re-allocation{cancelledBidsCount > 1 ? 's' : ''} Handled</span>
          </div>
        )}
      </div>

      {/* Timeline Steps Horizontal/Vertical Flow */}
      <div className="relative pl-6 sm:pl-0 sm:grid sm:grid-cols-5 gap-4">
        {/* Progress connecting line for desktop */}
        <div className="hidden sm:block absolute top-5 left-10 right-10 h-1 bg-stone-200 -z-0" />

        {steps.map((st, idx) => {
          const isCompleted = st.status === 'completed';
          const isActive = st.status === 'active';
          const isPending = st.status === 'pending';

          return (
            <div
              key={st.step}
              className={`relative z-10 flex flex-col sm:items-center sm:text-center space-y-2 mb-6 sm:mb-0 ${
                isPending ? 'opacity-60' : ''
              }`}
            >
              {/* Node Icon */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isActive
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isActive ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  st.step
                )}
              </div>

              {/* Title & Description */}
              <div className="sm:text-center">
                <div
                  className={`text-xs font-black uppercase tracking-wider ${
                    isActive ? 'text-amber-800' : isCompleted ? 'text-emerald-800' : 'text-stone-500'
                  }`}
                >
                  Step {st.step}
                </div>
                <div className="text-sm font-black text-stone-900 leading-snug">
                  {st.title}
                </div>
                <p className="text-[11px] text-stone-500 mt-1 leading-normal max-w-[160px] mx-auto">
                  {st.description}
                </p>
                {st.timestamp && (
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {new Date(st.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Buyer Confirmation & Cancellation Fallback Controls */}
      {currentStageIndex === 3 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-black text-stone-900 text-sm sm:text-base">
                  Buyer Confirmation
                </h4>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Confirm the sale or select the next available buyer if cancelled.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={onSimulateBuyerConfirm}
                disabled={isActionLoading}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="font-bold"
              >
                Confirm Sale
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onSimulateBuyerCancel}
                disabled={isActionLoading}
                icon={<XCircle className="w-4 h-4 text-rose-600" />}
                className="font-bold text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Buyer Cancelled
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Stage Banner */}
      {currentStageIndex === 4 && (
        <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h4 className="font-black text-base sm:text-lg">
                Transaction Confirmed & Locked!
              </h4>
              <p className="text-xs text-emerald-200">
                Purchase commitment confirmed. Digital weighment slip generated and farm-gate dispatch scheduled.
              </p>
            </div>
          </div>

          <div className="bg-emerald-800/80 px-4 py-2 rounded-xl text-center self-start sm:self-auto">
            <div className="text-[10px] text-emerald-300 font-bold uppercase">Weighment Slip</div>
            <div className="text-sm font-mono font-black text-white">
              {steps[4]?.weighmentSlipNo || 'FG-W492-LIVE'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
