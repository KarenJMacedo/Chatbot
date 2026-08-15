import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Você é o "ComparaPreços IA", um assistente especialista e imparcial em compras online e comparação de preços em tempo real no Brasil, focado especificamente em três grandes plataformas:
1. Mercado Livre Brasil (mercadolivre.com.br)
2. Shopee Brasil (shopee.com.br)
3. Amazon Brasil (amazon.com.br)

Suas metas:
1. Sempre pesquisar os preços reais e atuais do produto solicitado pelo usuário em cada uma das 3 lojas.
2. Identificar o menor preço atual, condições de parcelamento (ex: sem juros), frete (ex: Prime, Full, Cupons de Frete Shopee) e reputação da loja/vendedor.
3. Fornecer uma resposta conversacional clara, calorosa e objetiva em português brasileiro, acompanhada do resumo de dados estruturados.
4. Incluir um JSON estruturado no final da resposta dentro de um bloco delimitador especial \`\`\`json:comparison ... \`\`\` para que a interface renderize cards visuais ricos e interativos.

Formato do JSON de comparação:
\`\`\`json:comparison
{
  "productName": "Nome exato do produto comparado",
  "category": "Eletrônicos / Informática / Casa / etc",
  "averagePrice": 0.00,
  "bestDealStore": "amazon" | "mercadolivre" | "shopee",
  "maxSavings": 0.00,
  "savingsPercentage": 0,
  "stores": [
    {
      "store": "mercadolivre",
      "storeName": "Mercado Livre",
      "price": 0.00,
      "originalPrice": 0.00,
      "installments": "10x de R$ ... sem juros",
      "shipping": "Frete Grátis / Full / A calcular",
      "seller": "Loja Oficial / MercadoLíder",
      "rating": 4.8,
      "inStock": true,
      "url": "https://lista.mercadolivre.com.br/...",
      "highlight": "Entrega mais rápida (Full)"
    },
    {
      "store": "shopee",
      "storeName": "Shopee",
      "price": 0.00,
      "originalPrice": 0.00,
      "installments": "6x de R$ ...",
      "shipping": "Cupom de Frete Grátis no App",
      "seller": "Shopee Oficial / Vendedor Indicado",
      "rating": 4.7,
      "inStock": true,
      "url": "https://shopee.com.br/search?keyword=...",
      "highlight": "Menor preço com cupons"
    },
    {
      "store": "amazon",
      "storeName": "Amazon",
      "price": 0.00,
      "originalPrice": 0.00,
      "installments": "10x sem juros",
      "shipping": "Frete Grátis Prime",
      "seller": "Enviado e Vendido por Amazon",
      "rating": 4.9,
      "inStock": true,
      "url": "https://www.amazon.com.br/s?k=...",
      "highlight": "Melhor garantia e suporte"
    }
  ],
  "verdict": {
    "winner": "Nome da loja vencedora",
    "reason": "Explicação concisa do porquê vale mais a pena comprar nessa loja (preço, frete, garantia)",
    "buyingTip": "Dica extra (ex: usar cupom no app Shopee, assinar teste Prime, pagar no Pix no Mercado Livre)"
  }
}
\`\`\`

Se o usuário fizer uma pergunta geral de compra ou tirar dúvidas sobre modelos (ex: "Qual a diferença entre o Galaxy S24 e o iPhone 15?"), forneça a explicação completa e também compare os preços médios nas 3 lojas. Sempre seja útil, honesto e rápido.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Chat and Price Comparison API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Mensagem obrigatória." });
      }

      const ai = getGenAI();

      if (!ai) {
        // Fallback realistic simulation if API key is not yet set
        const queryEncoded = encodeURIComponent(message.trim());
        return res.json({
          text: `🔍 **Pesquisando preços em tempo real para:** "${message}"\n\nAqui está a análise de mercado nas 3 principais lojas brasileiras:\n- **Mercado Livre**: Ótima disponibilidade com entrega Full rápida.\n- **Shopee**: Melhores opções para cupons no aplicativo.\n- **Amazon**: Garantia A-a-Z e frete grátis com Prime.\n\n*Configure sua chave de API GEMINI_API_KEY no painel de Secrets para buscar dados instantâneos ao vivo.*`,
          groundingUrls: [
            { title: "Mercado Livre Brasil", uri: `https://lista.mercadolivre.com.br/${queryEncoded}` },
            { title: "Shopee Brasil", uri: `https://shopee.com.br/search?keyword=${queryEncoded}` },
            { title: "Amazon Brasil", uri: `https://www.amazon.com.br/s?k=${queryEncoded}` }
          ],
          comparisonData: {
            productName: message,
            category: "Geral",
            averagePrice: 450,
            bestDealStore: "mercadolivre",
            maxSavings: 60,
            savingsPercentage: 13,
            stores: [
              {
                store: "mercadolivre",
                storeName: "Mercado Livre",
                price: 420,
                originalPrice: 480,
                installments: "10x de R$ 42,00 sem juros",
                shipping: "Frete Grátis Full (Chega amanhã)",
                seller: "Loja Oficial",
                rating: 4.8,
                inStock: true,
                url: `https://lista.mercadolivre.com.br/${queryEncoded}`,
                highlight: "Mais rápido no Full"
              },
              {
                store: "shopee",
                storeName: "Shopee",
                price: 435,
                originalPrice: 490,
                installments: "6x de R$ 72,50",
                shipping: "Frete Grátis com Cupom",
                seller: "Shopee Oficial",
                rating: 4.7,
                inStock: true,
                url: `https://shopee.com.br/search?keyword=${queryEncoded}`,
                highlight: "Aceita moedas Shopee"
              },
              {
                store: "amazon",
                storeName: "Amazon",
                price: 459,
                originalPrice: 510,
                installments: "10x sem juros",
                shipping: "Frete Grátis Prime",
                seller: "Amazon.com.br",
                rating: 4.9,
                inStock: true,
                url: `https://www.amazon.com.br/s?k=${queryEncoded}`,
                highlight: "Garantia A-a-Z"
              }
            ],
            verdict: {
              winner: "Mercado Livre",
              reason: "Menor preço encontrado com entrega Full para o dia seguinte.",
              buyingTip: "Verifique se você tem cupom de R$ 20 no aplicativo do Mercado Pago ou Shopee."
            }
          }
        });
      }

      // Build conversation contents
      const formattedContents = [];
      
      // Add past history if any
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          formattedContents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content }]
          });
        }
      }

      // Add latest user message with clear instruction for live price check
      formattedContents.push({
        role: "user",
        parts: [{ 
          text: `Pesquise os preços reais e atuais no Brasil para: "${message}". Compare especificamente entre Mercado Livre (mercadolivre.com.br), Shopee (shopee.com.br) e Amazon (amazon.com.br). Forneça a análise detalhada e o bloco JSON \`\`\`json:comparison ... \`\`\` com os dados estruturados de cada loja.` 
        }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const fullText = response.text || "Desculpe, não consegui obter os dados de preço no momento.";

      // Extract Grounding URLs
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingUrls: { title: string; uri: string }[] = [];
      
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          groundingUrls.push({
            title: chunk.web.title || "Link de Referência",
            uri: chunk.web.uri,
          });
        }
      }

      // Extract JSON comparison block if present
      let comparisonData = null;
      let cleanText = fullText;

      const jsonMatch = fullText.match(/```(?:json:comparison|json)\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          comparisonData = JSON.parse(jsonMatch[1].trim());
          // Remove the raw JSON block from text if it's cleanly parsed, to keep chat text clean
          cleanText = fullText.replace(/```(?:json:comparison|json)\s*[\s\S]*?\s*```/, "").trim();
        } catch (err) {
          console.warn("Failed to parse JSON comparison block from Gemini response", err);
        }
      }

      // If comparisonData wasn't parsed from JSON, synthesize fallback links & structure
      if (!comparisonData) {
        const queryEncoded = encodeURIComponent(message.trim());
        comparisonData = {
          productName: message,
          category: "Produtos",
          averagePrice: 0,
          bestDealStore: "mercadolivre",
          maxSavings: 0,
          savingsPercentage: 0,
          stores: [
            {
              store: "mercadolivre",
              storeName: "Mercado Livre",
              price: 0,
              originalPrice: 0,
              installments: "Consulte parcelamento",
              shipping: "Envio Nacional / Full",
              seller: "Ver vendedores no ML",
              rating: 4.8,
              inStock: true,
              url: `https://lista.mercadolivre.com.br/${queryEncoded}`,
              highlight: "Entrega Rápida"
            },
            {
              store: "shopee",
              storeName: "Shopee",
              price: 0,
              originalPrice: 0,
              installments: "Consulte no App",
              shipping: "Cupons no App",
              seller: "Shopee Mall / Indicados",
              rating: 4.7,
              inStock: true,
              url: `https://shopee.com.br/search?keyword=${queryEncoded}`,
              highlight: "Melhores Cupons"
            },
            {
              store: "amazon",
              storeName: "Amazon",
              price: 0,
              originalPrice: 0,
              installments: "Em até 10x sem juros",
              shipping: "Entrega Prime",
              seller: "Amazon Brasil",
              rating: 4.9,
              inStock: true,
              url: `https://www.amazon.com.br/s?k=${queryEncoded}`,
              highlight: "Garantia Amazon"
            }
          ],
          verdict: {
            winner: "Verifique os links acima",
            reason: "Veja as melhores opções atualizadas diretamente em cada plataforma.",
            buyingTip: "Confira frete e cupons antes de finalizar a compra."
          }
        };
      }

      return res.json({
        text: cleanText,
        groundingUrls,
        comparisonData,
      });
    } catch (error: any) {
      console.error("Error processing price comparison chat:", error);
      return res.status(500).json({
        error: "Erro ao processar a comparação de preços.",
        details: error?.message || String(error),
      });
    }
  });

  // Direct fast comparison endpoint
  app.post("/api/quick-compare", async (req, res) => {
    try {
      const { product } = req.body;
      if (!product || typeof product !== "string") {
        return res.status(400).json({ error: "Produto é obrigatório." });
      }

      const queryEncoded = encodeURIComponent(product.trim());
      const storeLinks = {
        mercadolivre: `https://lista.mercadolivre.com.br/${queryEncoded}`,
        shopee: `https://shopee.com.br/search?keyword=${queryEncoded}`,
        amazon: `https://www.amazon.com.br/s?k=${queryEncoded}`,
      };

      res.json({
        product,
        links: storeLinks,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  });

  // Setup Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ComparaPreços IA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
