import React from "react";
import { ComparisonData, StoreDeal } from "../types";
import { ExternalLink, CheckCircle, Zap, ShieldCheck, Tag, TrendingDown, Award, Sparkles } from "lucide-react";

interface ComparisonCardsProps {
  data: ComparisonData;
  onSetAlert?: (productName: string, currentPrice: number, store: string) => void;
  onSaveFavorite?: (productName: string, bestPrice: number, bestStore: string, url: string) => void;
  isFavorite?: boolean;
}

export const ComparisonCards: React.FC<ComparisonCardsProps> = ({
  data,
  onSetAlert,
  onSaveFavorite,
  isFavorite = false,
}) => {
  if (!data || !data.stores || data.stores.length === 0) return null;

  const validStores = data.stores.filter((s) => s.price > 0);
  const lowestPrice = validStores.length > 0 ? Math.min(...validStores.map((s) => s.price)) : 0;
  const highestPrice = validStores.length > 0 ? Math.max(...validStores.map((s) => s.price)) : 0;
  const priceDiff = highestPrice > 0 && lowestPrice > 0 ? highestPrice - lowestPrice : (data.maxSavings || 0);

  const formatBRL = (val?: number) => {
    if (!val || val <= 0) return "Consultar";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getStoreConfig = (storeId: string, isBestDeal: boolean) => {
    switch (storeId.toLowerCase()) {
      case "mercadolivre":
        return {
          name: "Mercado Livre",
          borderBottom: "border-b-4 border-yellow-400",
          tagBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
          badgeLabel: isBestDeal ? "Melhor Escolha" : "Mercado Livre",
          badgeColor: isBestDeal ? "text-yellow-600" : "text-slate-400",
          pillBg: "bg-yellow-50 text-yellow-700",
          btnStyle: isBestDeal
            ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-md shadow-yellow-400/30"
            : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white",
        };
      case "shopee":
        return {
          name: "Shopee",
          borderBottom: "border-b-4 border-orange-500",
          tagBg: "bg-orange-50 text-orange-800 border-orange-200",
          badgeLabel: isBestDeal ? "Melhor Escolha" : "Shopee Brasil",
          badgeColor: isBestDeal ? "text-orange-600" : "text-slate-400",
          pillBg: "bg-orange-50 text-orange-600",
          btnStyle: isBestDeal
            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30"
            : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white",
        };
      case "amazon":
      default:
        return {
          name: "Amazon Prime",
          borderBottom: "border-b-4 border-cyan-500",
          tagBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
          badgeLabel: isBestDeal ? "Melhor Escolha" : "Amazon Prime",
          badgeColor: isBestDeal ? "text-cyan-700" : "text-slate-400",
          pillBg: "bg-slate-50 text-slate-600",
          btnStyle: isBestDeal
            ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/30"
            : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white",
        };
    }
  };

  return (
    <div className="w-full my-4 bg-slate-100/70 border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm transition-all">
      {/* Product Header & Savings Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
              Resultado Comparativo
            </span>
            {data.category && (
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {data.category}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {data.productName}
          </h3>
        </div>

        {priceDiff > 0 && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 self-start sm:self-auto shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Economia de até</div>
              <div className="text-base font-black text-emerald-700">
                {formatBRL(priceDiff)} {data.savingsPercentage ? `(-${data.savingsPercentage}%)` : ""}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 Store Polish Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.stores.map((storeDeal: StoreDeal) => {
          const isBestPrice = lowestPrice > 0 && storeDeal.price === lowestPrice;
          const conf = getStoreConfig(storeDeal.store, isBestPrice);

          return (
            <div
              key={storeDeal.store}
              id={`card-store-${storeDeal.store}`}
              className={`bg-white rounded-2xl p-6 ${conf.borderBottom} shadow-sm flex flex-col justify-between transition-all duration-200 ${
                isBestPrice
                  ? "shadow-xl shadow-indigo-100 ring-2 ring-indigo-500/20 relative"
                  : "border border-slate-200 hover:shadow-md"
              }`}
            >
              {isBestPrice && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Menor Preço
                </div>
              )}

              <div>
                {/* Store Label */}
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-bold uppercase tracking-widest ${conf.badgeColor}`}>
                    {conf.badgeLabel}
                  </p>
                  {storeDeal.rating && (
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ★ {storeDeal.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  {storeDeal.originalPrice && storeDeal.originalPrice > storeDeal.price && (
                    <div className="text-xs text-slate-400 line-through mb-0.5 font-medium">
                      {formatBRL(storeDeal.originalPrice)}
                    </div>
                  )}
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">
                    {formatBRL(storeDeal.price)}
                  </div>
                  {storeDeal.installments && (
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {storeDeal.installments}
                    </p>
                  )}
                </div>

                {/* Shipping & Highlights in Pill format */}
                <div className="space-y-2 mb-6">
                  {storeDeal.shipping && (
                    <div className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold flex items-center gap-2 ${conf.pillBg}`}>
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{storeDeal.shipping}</span>
                    </div>
                  )}
                  {storeDeal.highlight && (
                    <div className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{storeDeal.highlight}</span>
                    </div>
                  )}
                  {storeDeal.seller && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1 font-medium">
                      <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{storeDeal.seller}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <a
                id={`link-buy-${storeDeal.store}`}
                href={storeDeal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${conf.btnStyle}`}
              >
                <span>Ver Oferta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* AI Verdict - Professional Polish Style */}
      {data.verdict && (
        <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Veredito da IA
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {data.verdict.winner}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {data.verdict.reason}
                </p>
                {data.verdict.buyingTip && (
                  <p className="text-xs text-indigo-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>💡 Dica de Compra:</span> {data.verdict.buyingTip}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase tracking-wider self-end sm:self-center shrink-0 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span>Melhor custo-benefício</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer quick actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
        {onSetAlert && (
          <button
            onClick={() => onSetAlert(data.productName, lowestPrice, data.bestDealStore || "mercadolivre")}
            className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-600" /> Criar alerta de preço
          </button>
        )}

        {onSaveFavorite && (
          <button
            onClick={() => {
              const bestStore = data.stores.find((s) => s.price === lowestPrice) || data.stores[0];
              onSaveFavorite(data.productName, lowestPrice, bestStore.store, bestStore.url);
            }}
            className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isFavorite ? "text-indigo-600 fill-indigo-100" : ""}`} />
            {isFavorite ? "Salvo nas ofertas" : "Salvar esta comparação"}
          </button>
        )}
      </div>
    </div>
  );
};
