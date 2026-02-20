import { useRef, useState, useCallback } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language } from "@/types/statement";
import { t } from "@/lib/i18n";

interface UploadZoneProps {
  lang: Language;
  onFileSelected: (file: File) => void;
}

export function UploadZone({ lang, onFileSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError(
          lang === "zh"
            ? "请上传PDF文件。"
            : lang === "es"
            ? "Por favor sube un archivo PDF."
            : "Please upload a PDF file."
        );
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError(
          lang === "zh"
            ? "文件大小不能超过20MB。"
            : lang === "es"
            ? "El archivo no puede superar 20MB."
            : "File must be under 20MB."
        );
        return;
      }
      onFileSelected(file);
    },
    [lang, onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200",
          isDragging
            ? "border-primary bg-[hsl(var(--brand-light))] scale-[1.01]"
            : "border-border bg-card hover:border-primary/50 hover:bg-[hsl(var(--brand-light))]"
        )}
        style={{ minHeight: 280 }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={t(lang, "uploadTitle")}
      >
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-200",
            isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-[hsl(var(--brand-light))] text-primary"
          )}
        >
          <Upload className="h-9 w-9" strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{t(lang, "uploadTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t(lang, "uploadDesc")}
          </p>
          <p className="text-xs text-muted-foreground">{t(lang, "uploadHint")}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="min-h-[44px] rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[hsl(var(--brand-dark))] transition-colors"
        >
          {t(lang, "browseButton")}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
          aria-hidden="true"
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
