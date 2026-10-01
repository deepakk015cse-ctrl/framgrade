import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminFarmersPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();
  const [search, setSearch] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');

  const [farmers, setFarmers] = useState([
    {
      id: 1,
      name: 'Murugan Selvam',
      phone: '9842177312',
      village: 'Oddanchatram',
      district: 'Dindigul',
      primaryCrop: 'Tomato & Chilli',
      status: 'verified',
      lotsCount: 3,
      registeredAt: '2026-08-15',
    },
    {
      id: 2,
      name: 'Ravi Kumar',
      phone: '9443211890',
      village: 'Konganapuram',
      district: 'Salem',
      primaryCrop: 'Tomato Hybrid',
      status: 'verified',
      lotsCount: 2,
      registeredAt: '2026-09-01',
    },
    {
      id: 3,
      name: 'Selvaraj V.',
      phone: '9842233445',
      village: 'Reddiarchatram',
      district: 'Dindigul',
      primaryCrop: 'Onion Shallots',
      status: 'verified',
      lotsCount: 1,
      registeredAt: '2026-09-10',
    },
    {
      id: 4,
      name: 'Perumal Kandasamy',
      phone: '9789123456',
      village: 'Dharapuram',
      district: 'Tiruppur',
      primaryCrop: 'Country Onion',
      status: 'pending_kyc',
      lotsCount: 1,
      registeredAt: '2026-09-20',
    },
    {
      id: 5,
      name: 'Muthusamy P.',
      phone: '9442156789',
      village: 'Palani Rural',
      district: 'Dindigul',
      primaryCrop: 'Banana G-9',
      status: 'verified',
      lotsCount: 4,
      registeredAt: '2026-07-28',
    },
  ]);

  useEffect(() => {
    api.farmers.getAll().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setFarmers(res.data);
      }
    }).catch(() => {});
  }, []);

  const filtered = farmers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      f.village.toLowerCase().includes(search.toLowerCase());
    const matchesVillage = filterVillage === 'all' || f.village === filterVillage;
    return matchesSearch && matchesVillage;
  });

  const villages = Array.from(new Set(farmers.map((f) => f.village)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Registered Farmers
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
              {farmers.length} Total
            </span>
          </div>
          <p className="text-stone-600 text-sm mt-0.5">
            Manage village farmer directory, produce lots, and KYC status across local panchayats.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => {
            setRole('farmer');
            navigate('/farmer/add-produce');
          }}
        >
          Add Farmer Listing
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          />
        </div>

        <div>
          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px] bg-white font-semibold"
          >
            <option value="all">All Villages</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Single-Column Cards (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {filtered.map((farmer) => (
          <div
            key={farmer.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-stone-900">{farmer.name}</h3>
                <p className="text-xs text-stone-500 font-semibold">{farmer.primaryCrop}</p>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  farmer.status === 'verified'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {farmer.status === 'verified' ? 'Verified' : 'Pending KYC'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-bold">{farmer.village}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="font-bold">{farmer.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-600 font-bold">
                {farmer.lotsCount} Active Lots Listed
              </span>
              <a
                href={`tel:${farmer.phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 min-h-[36px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Farmer</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-700 text-xs uppercase font-black border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Farmer Name</th>
              <th className="py-3.5 px-4">Village & District</th>
              <th className="py-3.5 px-4">Primary Produce</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((farmer) => (
              <tr key={farmer.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-black text-stone-900">{farmer.name}</td>
                <td className="py-3.5 px-4 text-stone-700 font-medium">
                  {farmer.village}, {farmer.district}
                </td>
                <td className="py-3.5 px-4 text-stone-800 font-semibold">{farmer.primaryCrop}</td>
                <td className="py-3.5 px-4 font-mono text-stone-700">{farmer.phone}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full ${
                      farmer.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{farmer.status === 'verified' ? 'Verified' : 'Pending'}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={`tel:${farmer.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No farmers match your criteria"
          description="Try changing your search term or village filter."
        />
      )}
    </div>
  );
};
