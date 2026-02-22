import { useState, useCallback } from "react";
import { Language, StatementData, AppState, ChatMessage } from "@/types/statement";
import { t } from "@/lib/i18n";
import { UploadZone } from "@/components/UploadZone";
import { FileBar } from "@/components/FileBar";
import { LoadingView } from "@/components/LoadingView";
import { SummaryView } from "@/components/SummaryView";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AlertCircle, RefreshCw } from "lucide-react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [lang, setLang] = useState<Language>("en");
  const [appState, setAppState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setAppState("file-ready");
    setErrorMsg("");
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setStatementData(null);
    setErrorMsg("");
    setPdfBase64(null);
    setChatMessages([]);
    setChatLoading(false);
    setAppState("upload");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setAppState("loading");

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix to get just base64
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const { data, error } = await supabase.functions.invoke("analyze-statement", {
        body: {
          pdfBase64: base64,
          filename: selectedFile.name,
        },
      });

      if (error) {
        throw new Error(error.message || "Function invocation failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.data) {
        throw new Error("No data returned from analysis");
      }

      setPdfBase64(base64);
      setStatementData(data.data);
      setAppState("summary");
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
      setAppState("error");
    }
  }, [selectedFile]);

  const handleChatSend = useCallback(async (text: string) => {
    if (!pdfBase64) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-statement", {
        body: {
          pdfBase64,
          messages: updatedMessages,
          lang,
        },
      });

      if (error) throw new Error(error.message || "Chat request failed");
      if (data?.error) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: t(lang, "chatError"),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setChatLoading(false);
    }
  }, [pdfBase64, chatMessages, lang]);

  return (
    <div className="min-h-screen bg-background">
      {/* Print-only title */}
      <div className="hidden print:block text-center py-4 border-b border-border mb-6">
        <h1 className="text-xl font-bold">{t(lang, "appTitle")}</h1>
      </div>

      {/* Header */}
      <header className="no-print border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* ChowBus wordmark / icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <span className="text-sm font-black text-primary-foreground">CB</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">{t(lang, "appTitle")}</h1>
              <p className="hidden sm:block text-xs text-muted-foreground">{t(lang, "appSubtitle")}</p>
            </div>
          </div>
          {appState !== "summary" && (
            <LanguageToggle lang={lang} setLang={setLang} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-8 print:px-0 print:py-0">
        {/* UPLOAD STATE */}
        {appState === "upload" && (
          <div className="flex flex-col items-center justify-center pt-8">
            <UploadZone lang={lang} onFileSelected={handleFileSelected} />
            <PrivacyNotice lang={lang} />
          </div>
        )}

        {/* FILE READY STATE */}
        {appState === "file-ready" && (
          <div className="flex flex-col items-center justify-center pt-8">
            <UploadZone lang={lang} onFileSelected={handleFileSelected} />
            <FileBar
              filename={selectedFile?.name || ""}
              lang={lang}
              isLoading={false}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
            />
            <PrivacyNotice lang={lang} />
          </div>
        )}

        {/* LOADING STATE */}
        {appState === "loading" && (
          <div className="flex flex-col items-center pt-8">
            <div className="w-full max-w-2xl">
              <FileBar
                filename={selectedFile?.name || ""}
                lang={lang}
                isLoading={true}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
              />
            </div>
            <LoadingView lang={lang} />
          </div>
        )}

        {/* ERROR STATE */}
        {appState === "error" && (
          <div className="flex flex-col items-center justify-center pt-8 gap-4">
            <div className="w-full max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-7 w-7" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{t(lang, "errorTitle")}</h3>
                {errorMsg && (
                  <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
                )}
              </div>
              <button
                onClick={selectedFile ? () => { setAppState("file-ready"); setErrorMsg(""); } : handleReset}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[hsl(var(--brand-dark))] transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {t(lang, "errorRetry")}
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY STATE */}
        {appState === "summary" && statementData && (
          <SummaryView
            data={statementData}
            lang={lang}
            setLang={setLang}
            onReset={handleReset}
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            onChatSend={handleChatSend}
          />
        )}
      </main>
    </div>
  );
}
