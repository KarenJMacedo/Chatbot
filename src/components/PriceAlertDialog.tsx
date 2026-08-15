import React, { useState } from "react";
import { PriceAlert } from "../types";
import { X, Bell, Trash2, CheckCircle2 } from "lucide-react";

interface PriceAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (productName: string, targetPrice: number, currentPrice: number, store: string) => void;
  onRemoveAlert: (id: string) => void;
  initialProduct?: { productName: string; currentPrice: number; store: string } | null;
}

export const PriceAlertDialog: React.FC<PriceAlertDialogProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  initialProduct,
}) => {
  const [productName, setProductName] = useState(initialProduct?.productName || "");
  const [targetPrice, setTargetPrice] = useState(
    initialProduct?.currentPrice ? (initialProduct.currentPrice * 0.9).toFixed(2) : ""
  );
  const [store, setStore] = useState(initialProduct?.store || "mercadolivre");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !targetPrice) return;

    const targetVal = parseFloat(targetPrice.replace(",", "."));
    const currentVal = initialProduct?.currentPrice || targetVal * 1.1;

    onAddAlert(productName.trim(), targetVal, currentVal, store);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setProductName("");
      setTargetPrice("");
    }, 1500);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-base">Monitoramento & Alertas de Preço</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Create Alert Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Criar Alerta de Queda de Preço:
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: PlayStation 5 Slim"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Alvo Desejado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="3200.00"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loja de Preferência</label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  <option value="todas">Qualquer Loja</option>
                  <option value="mercadolivre">Mercado Livre</option>
                  <option value="shopee">Shopee</option>
                  <option value="amazon">Amazon</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alerta Ativado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Ativar Monitoramento</span>
                </>
              )}
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Alertas Ativos ({alerts.length})
            </div>

            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                Nenhum alerta cadastrado no momento.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{alert.productName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
                        Alvo: <span className="text-emerald-600 font-bold">{formatBRL(alert.targetPrice)}</span> • Loja: {alert.store}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveAlert(alert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
