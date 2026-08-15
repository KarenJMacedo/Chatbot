import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Sparkles, Filter } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [installmentsFocus, setInstallmentsFocus] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "pt-BR";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("O reconhecimento de voz não é suportado pelo seu navegador atual.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition start error:", err);
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;

    let finalPrompt = input.trim();
    if (freeShippingOnly && !finalPrompt.toLowerCase().includes("frete")) {
      finalPrompt += " (filtrar por opções com frete grátis)";
    }
    if (installmentsFocus && !finalPrompt.toLowerCase().includes("parcela")) {
      finalPrompt += " (destacar melhor parcelamento sem juros)";
    }

    onSend(finalPrompt);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Optional Filter Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 hidden sm:inline">
            <Filter className="w-3 h-3 text-slate-400" /> Preferências:
          </span>
          <button
            type="button"
            onClick={() => setFreeShippingOnly(!freeShippingOnly)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              freeShippingOnly
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🚚 Frete Grátis
          </button>
          <button
            type="button"
            onClick={() => setInstallmentsFocus(!installmentsFocus)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              installmentsFocus
                ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            💳 10x sem juros
          </button>
        </div>

        {/* Input Bar Container */}
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Pesquise um produto (ex: 'PlayStation 5 Slim' ou 'Air Fryer Mondial 4L')..."
            className="flex-1 bg-transparent border-0 resize-none text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-0 px-3 py-1.5 max-h-32 min-h-[38px] leading-relaxed font-medium"
          />

          <div className="flex items-center gap-1.5 pb-0.5">
            {/* Voice Input */}
            <button
              id="btn-voice-input"
              type="button"
              onClick={toggleListening}
              disabled={disabled}
              title={isListening ? "Parar gravação" : "Falar produto por voz"}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              id="btn-send-message"
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
              title="Comparar preços"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Comparação ao vivo no Mercado Livre, Shopee e Amazon Brasil
          </span>
          <span className="hidden sm:inline">Pressione Enter para enviar</span>
        </div>
      </div>
    </div>
  );
};
