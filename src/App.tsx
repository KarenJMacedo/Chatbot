import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { QuickSearchPills } from "./components/QuickSearchPills";
import { PriceAlertDialog } from "./components/PriceAlertDialog";
import { FavoritesDrawer } from "./components/FavoritesDrawer";
import { Message, PriceAlert, FavoriteDeal } from "./types";
import { ShieldCheck, Zap, Truck, Tag, TrendingDown } from "lucide-react";

const INITIAL_MESSAGE: Message = {
  id: "welcome-msg",
  role: "assistant",
  content: `👋 Olá! Sou o **ComparaPreços IA**, seu assistente para monitoramento e comparação de preços em tempo real no Brasil.

Estou conectado diretamente às 3 principais plataformas:
- **Mercado Livre**: Entrega rápida Full e condições no Mercado Pago.
- **Shopee**: Cupons exclusivos de desconto e frete no aplicativo.
- **Amazon**: Garantia de compra e frete grátis Prime.

Digite qualquer produto para consultar os melhores preços agora!`,
  timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("comparaprecos_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem("comparaprecos_alerts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load alerts:", e);
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<FavoriteDeal[]>(() => {
    const saved = localStorage.getItem("comparaprecos_favorites");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [alertProductInit, setAlertProductInit] = useState<{
    productName: string;
    currentPrice: number;
    store: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("comparaprecos_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("comparaprecos_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("comparaprecos_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const loadingAssistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingAssistantMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isLoading && !m.error)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro na busca de preços (${res.status})`);
      }

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === loadingAssistantMessage.id) {
            return {
              ...msg,
              content: data.text || "Preços comparados com sucesso!",
              comparisonData: data.comparisonData,
              groundingUrls: data.groundingUrls,
              isLoading: false,
            };
          }
          return msg;
        })
      );
    } catch (err: any) {
      console.error("Error communicating with AI price comparator:", err);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === loadingAssistantMessage.id) {
            return {
              ...msg,
              content:
                "Não foi possível consultar os preços no momento. Por favor, tente novamente em instantes.",
              isLoading: false,
              error: true,
            };
          }
          return msg;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Deseja realmente limpar o histórico da conversa?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem("comparaprecos_chat_history");
    }
  };

  const handleSetAlert = (productName: string, currentPrice: number, store: string) => {
    setAlertProductInit({ productName, currentPrice, store });
    setIsAlertModalOpen(true);
  };

  const handleAddAlert = (
    productName: string,
    targetPrice: number,
    currentPrice: number,
    store: string
  ) => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productName,
      targetPrice,
      currentPrice,
      store,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveFavorite = (
    productName: string,
    bestPrice: number,
    bestStore: string,
    url: string
  ) => {
    if (favorites.some((f) => f.productName.toLowerCase() === productName.toLowerCase())) {
      setFavorites((prev) =>
        prev.filter((f) => f.productName.toLowerCase() !== productName.toLowerCase())
      );
      return;
    }

    const newFav: FavoriteDeal = {
      id: `fav-${Date.now()}`,
      productName,
      bestPrice,
      bestStore,
      url,
      savedAt: new Date().toLocaleDateString("pt-BR"),
    };
    setFavorites((prev) => [newFav, ...prev]);
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <Header
        onOpenAlerts={() => {
          setAlertProductInit(null);
          setIsAlertModalOpen(true);
        }}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onClearChat={handleClearChat}
        alertCount={alerts.length}
        favoriteCount={favorites.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto flex flex-col px-4 sm:px-6 py-5">
        {/* Professional Monitor Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold text-xs shrink-0 border border-yellow-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Mercado Livre</p>
              <p className="text-[11px] text-slate-500 font-medium">Entrega Full & Mercado Pago</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Shopee Brasil</p>
              <p className="text-[11px] text-slate-500 font-medium">Cupons de Frete & App</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs shrink-0 border border-cyan-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Amazon Prime</p>
              <p className="text-[11px] text-slate-500 font-medium">Garantia & Frete Grátis</p>
            </div>
          </div>
        </div>

        {/* Popular Quick Pills */}
        <QuickSearchPills onSelect={handleSendMessage} disabled={isLoading} />

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3">
          {messages.map((msg) => {
            const isFav =
              msg.comparisonData &&
              favorites.some(
                (f) =>
                  f.productName.toLowerCase() ===
                  msg.comparisonData?.productName.toLowerCase()
              );

            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSetAlert={handleSetAlert}
                onSaveFavorite={handleSaveFavorite}
                isFavorite={Boolean(isFav)}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Sticky Bottom Chat Input */}
      <footer className="sticky bottom-0 z-20">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </footer>

      {/* Price Alert Dialog */}
      <PriceAlertDialog
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={handleRemoveAlert}
        initialProduct={alertProductInit}
      />

      {/* Saved Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onSelectProduct={(name) => handleSendMessage(`Compare o preço do ${name}`)}
      />
    </div>
  );
}
