import React from "react";
import { FavoriteDeal } from "../types";
import { X, Bookmark, ExternalLink, Trash2, Tag } from "lucide-react";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteDeal[];
  onRemoveFavorite: (id: string) => void;
  onSelectProduct: (productName: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-base">Ofertas Salvas ({favorites.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
          {favorites.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700 font-bold">
                Nenhuma oferta salva ainda.
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Ao comparar produtos, clique em "Salvar esta comparação" para monitorar os valores salvos.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{fav.productName}</h4>
                    <div className="text-xs text-emerald-600 font-extrabold mt-0.5">
                      Melhor Preço: {formatBRL(fav.bestPrice)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onSelectProduct(fav.productName);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-bold transition-all"
                  >
                    Comparar Novamente
                  </button>
                  <a
                    href={fav.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all"
                  >
                    <span>Comprar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
