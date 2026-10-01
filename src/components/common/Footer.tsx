import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { t, language } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight" data-no-translate="true">
                Farm<span className="text-emerald-400">Grade</span>
              </span>
            </div>
            <p className="text-xs font-bold text-amber-400 mb-2">
              {t('brand_tagline')}
            </p>
            <p className="text-stone-400 text-xs leading-relaxed">
              {t('farmer_subtitle')}
            </p>
          </div>

          {/* Farmers */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('nav_farmers')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/farmer/dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('nav_dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/add-produce" className="hover:text-emerald-400 transition-colors">
                  {t('nav_add_produce')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/market-prices" className="hover:text-emerald-400 transition-colors">
                  {t('nav_market_prices')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/bids" className="hover:text-emerald-400 transition-colors">
                  {t('nav_buyer_offers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Buyers */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('nav_buyers')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/buyer/dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('nav_dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/buyer/market" className="hover:text-emerald-400 transition-colors">
                  {t('nav_find_produce')}
                </Link>
              </li>
              <li>
                <Link to="/buyer/my-bids" className="hover:text-emerald-400 transition-colors">
                  {t('nav_my_bids')}
                </Link>
              </li>
              <li>
                <Link to="/buyer/purchases" className="hover:text-emerald-400 transition-colors">
                  {t('nav_purchases')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('Support')}</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:18004253276" className="hover:text-white">
                  1800-425-3276 ({language === 'ta' ? 'இலவச அழைப்பு' : language === 'hi' ? 'टोल-फ्री' : 'Toll-Free'})
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'ஒட்டன்சத்திரம் & சேலம் சந்தை மையங்கள்'
                    : language === 'hi'
                    ? 'ओड्डनचत्रम और सलेम बाज़ार केंद्र'
                    : 'Oddanchatram & Salem Market Hubs'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <span>
            © {new Date().getFullYear()} FarmGrade.{' '}
            {language === 'ta'
              ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
              : language === 'hi'
              ? 'सर्वाधिकार सुरक्षित।'
              : 'All rights reserved.'}
          </span>
          <div className="flex items-center gap-4">
            <Link to="/how-it-works" className="hover:text-stone-300">{t('nav_how_it_works')}</Link>
            <Link to="/about" className="hover:text-stone-300">{t('nav_about')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
