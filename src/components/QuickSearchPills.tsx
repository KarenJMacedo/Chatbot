import React from "react";
import { Flame, Smartphone, Gamepad2, Coffee, Headphones, Tv, Laptop } from "lucide-react";

interface QuickSearchPillsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

const POPULAR_QUERIES = [
  { icon: Smartphone, label: "iPhone 15 128GB", query: "Compare o preço do iPhone 15 128GB" },
  { icon: Gamepad2, label: "PlayStation 5 Slim", query: "Qual o menor preço do PlayStation 5 Slim com leitor?" },
  { icon: Coffee, label: "Air Fryer Mondial 4L", query: "Compare preços da Air Fryer Mondial 4 Litros" },
  { icon: Headphones, label: "Fone JBL Wave Buds", query: "Menor preço do fone bluetooth JBL Wave Buds" },
  { icon: Laptop, label: "Kindle 11ª Geração", query: "Preço do Kindle 11ª Geração Amazon vs Shopee vs ML" },
  { icon: Tv, label: "Smart TV 50 4K", query: "Compare as melhores Smart TVs 50 polegadas 4K" },
  { icon: Smartphone, label: "Galaxy S24 256GB", query: "Comparar preço do Samsung Galaxy S24 256GB" },
];

export const QuickSearchPills: React.FC<QuickSearchPillsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full py-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-2.5">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span>Consultas em Alta:</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300">
        {POPULAR_QUERIES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              id={`quick-query-${idx}`}
              onClick={() => onSelect(item.query)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50/60 active:scale-95 text-xs font-semibold text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-all shrink-0 shadow-sm disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
