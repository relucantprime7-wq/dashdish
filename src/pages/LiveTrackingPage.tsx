import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Clock, Navigation, WifiOff, Phone } from 'lucide-react';

export const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [signalStatus, setSignalStatus] = useState<'live' | 'lost'>('live');

  const statusSteps = [
    { label: 'Order Placed', time: '12:00 PM', done: true },
    { label: 'Confirmed', time: '12:02 PM', done: true },
    { label: 'Preparing', time: '12:08 PM', done: true },
    { label: 'Courier En Route', time: '12:20 PM', active: true },
    { label: 'Delivered', time: 'Est 12:30 PM', done: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Signal Simulation Toggle */}
        <button
          onClick={() => setSignalStatus((s) => (s === 'live' ? 'lost' : 'live'))}
          className="text-xs text-text-tertiary underline flex items-center gap-1 hover:text-text-primary"
        >
          <span>Simulate Courier Signal: {signalStatus === 'live' ? 'Live' : 'Lost'}</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">Live Order Tracking</h1>

      {/* Simulated Map View Container */}
      <div className="relative w-full h-64 sm:h-80 bg-surface rounded-card border border-border overflow-hidden flex flex-col justify-between p-4 shadow-card">
        {/* Mock Map Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#E8E8E4_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

        {/* Signal Lost Banner State (UX_SPEC.md §B.8 requirement) */}
        {signalStatus === 'lost' ? (
          <div className="absolute inset-0 bg-text-primary/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-4 text-center text-white gap-2">
            <WifiOff className="w-8 h-8 text-warning animate-bounce" />
            <h3 className="font-bold text-base">Signal Lost — Reconnecting...</h3>
            <p className="text-xs text-white/80 max-w-sm">
              Showing courier's last known location (0.8 mi away). Order status remains verified.
            </p>
          </div>
        ) : (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="honesty">
              Live Courier Stream
            </Badge>
          </div>
        )}

        {/* Route Line Simulation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-1 bg-accent/30 rounded-full flex items-center justify-between px-4">
            <div className="w-4 h-4 rounded-full bg-text-primary text-white text-[10px] font-bold flex items-center justify-center shadow">
              R
            </div>
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="w-4 h-4 rounded-full bg-honesty text-white text-[10px] font-bold flex items-center justify-center shadow">
              H
            </div>
          </div>
        </div>

        {/* Bottom Map Status Bar */}
        <div className="relative z-10 mt-auto bg-surface/95 backdrop-blur-md p-3.5 rounded-btn border border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-text-primary">Alex (Courier)</span>
              <span className="text-xs text-text-secondary">Toyota Prius • White</span>
            </div>
          </div>
          <button className="p-2 rounded-full border border-border hover:bg-bg text-text-primary">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ETA Explainable Banner */}
      <div className="bg-surface rounded-card border border-border p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-btn bg-accent/10 text-accent">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-text-tertiary uppercase">Updated ETA</span>
            <h2 className="text-xl font-bold text-text-primary">8–12 min</h2>
            <p className="text-xs text-text-secondary mt-0.5">Reason: Courier is 1.2 miles away with clear traffic.</p>
          </div>
        </div>
      </div>

      {/* Event Log Stepper */}
      <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-base text-text-primary">Order Status Timeline</h3>

        <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-border">
          {statusSteps.map((step) => (
            <div key={step.label} className="relative flex items-center justify-between gap-4">
              <div
                className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 bg-surface ${
                  step.done
                    ? 'border-honesty bg-honesty text-white'
                    : step.active
                    ? 'border-accent bg-accent animate-pulse'
                    : 'border-border'
                }`}
              />
              <span className={`text-sm ${step.active ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
                {step.label}
              </span>
              <span className="text-xs text-text-tertiary">{step.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
