import React from "react";
import { Sparkles, Bell, Bookmark, Trash2, ArrowUpDown, Tag, Zap } from "lucide-react";

interface HeaderProps {
  onOpenAlerts: () => void;
  onOpenFavorites: () => void;
  onClearChat: () => void;
  alertCount: number;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlerts,
  onOpenFavorites,
  onClearChat,
  alertCount,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
                ComparaPreços <span className="text-indigo-600">IA</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Tempo Real</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Mercado Livre • Shopee • Amazon
            </p>
          </div>
        </div>

        {/* Store Badges - Clean Pill format */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-indigo-600" />
            Lojas:
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-yellow-100"></span> Mercado Livre
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-100"></span> Shopee
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-600 ring-2 ring-cyan-100"></span> Amazon
          </span>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-alerts"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Alertas de Preço"
            aria-label="Alertas de Preço"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                {alertCount}
              </span>
            )}
          </button>

          <button
            id="btn-favorites"
            onClick={onOpenFavorites}
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Ofertas Salvas"
            aria-label="Ofertas Salvas"
          >
            <Bookmark className="w-4 h-4" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                {favoriteCount}
              </span>
            )}
          </button>

          <button
            id="btn-clear-chat"
            onClick={onClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            title="Limpar Conversa"
            aria-label="Limpar Conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
