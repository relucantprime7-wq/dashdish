import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER, MOCK_ADDRESSES, MOCK_PAYMENT_METHODS } from '../data/mockData';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex items-center gap-4 bg-surface rounded-card border border-border p-5">
        <div className="w-14 h-14 rounded-full bg-accent text-white font-bold text-xl flex items-center justify-center">
          {MOCK_USER.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-text-primary">{MOCK_USER.name}</h1>
          <span className="text-xs text-text-secondary">{MOCK_USER.email} • {MOCK_USER.phone}</span>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
        <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span>Saved Addresses</span>
        </h3>
        <div className="flex flex-col gap-2">
          {MOCK_ADDRESSES.map((addr) => (
            <div key={addr.id} className="p-3 bg-bg rounded-btn border border-border flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-text-primary">{addr.label}</span>
                <p className="text-text-secondary">{addr.street}, {addr.city}</p>
              </div>
              {addr.isDefault && <span className="text-honesty font-semibold bg-honesty/10 px-2 py-0.5 rounded">Default</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
        <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-accent" />
          <span>Saved Payment Methods</span>
        </h3>
        <div className="flex flex-col gap-2">
          {MOCK_PAYMENT_METHODS.map((pm) => (
            <div key={pm.id} className="p-3 bg-bg rounded-btn border border-border flex justify-between items-center text-xs">
              <span className="font-semibold text-text-primary">{pm.brand} •••• {pm.last4}</span>
              {pm.isDefault && <span className="text-honesty font-semibold bg-honesty/10 px-2 py-0.5 rounded">Default</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
