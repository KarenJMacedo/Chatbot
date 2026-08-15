import React, { useState } from "react";
import { Message } from "../types";
import { ComparisonCards } from "./ComparisonCards";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check, ExternalLink, Globe, Sparkles, AlertCircle } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onSetAlert?: (productName: string, currentPrice: number, store: string) => void;
  onSaveFavorite?: (productName: string, bestPrice: number, bestStore: string, url: string) => void;
  isFavorite?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSetAlert,
  onSaveFavorite,
  isFavorite = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex gap-3 py-3 px-2 sm:px-4 transition-colors ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold shadow-sm">
          AI
        </div>
      )}

      {/* Message Content Body */}
      <div className={`flex flex-col max-w-[95%] sm:max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* User / Bot Header & Time */}
        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 font-medium">
          <span>{isUser ? "Você" : "PriceBot AI"}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Loading state */}
        {message.isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-5 shadow-sm w-full min-w-[280px] sm:min-w-[400px] space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Buscando ofertas ao vivo nas lojas...</span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-full"></div>
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-2/3"></div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="h-16 bg-yellow-50/70 border border-yellow-200 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-orange-50/70 border border-orange-200 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-cyan-50/70 border border-cyan-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        ) : message.error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl rounded-tl-none p-4 text-rose-800 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Falha ao buscar preços</p>
              <p className="mt-0.5 text-rose-700">{message.content}</p>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all ${
              isUser
                ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm w-full"
            }`}
          >
            {/* Markdown Text */}
            <div className={`prose prose-sm max-w-none space-y-2 ${isUser ? "text-white" : "text-slate-700"}`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Comparison Cards if available */}
            {message.comparisonData && (
              <ComparisonCards
                data={message.comparisonData}
                onSetAlert={onSetAlert}
                onSaveFavorite={onSaveFavorite}
                isFavorite={isFavorite}
              />
            )}

            {/* Live Search Sources */}
            {message.groundingUrls && message.groundingUrls.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Fontes pesquisadas em tempo real:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {message.groundingUrls.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition-colors"
                    >
                      <span className="truncate max-w-[180px]">{source.title || "Oferta Web"}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Copy message */}
            {!isUser && (
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 text-slate-400">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
                  title="Copiar texto"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[10px] font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-bold text-xs shadow-sm">
          U
        </div>
      )}
    </div>
  );
};
