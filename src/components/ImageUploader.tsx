"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Trash2, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Capa do Curso" }: ImageUploaderProps) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer upload da imagem.");
        setUploading(false);
        return;
      }

      onChange(data.url);
    } catch {
      setError("Erro de rede ao enviar o arquivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar imagem.");
        setUploading(false);
        return;
      }

      onChange(data.url);
    } catch {
      setError("Erro de conexão ao enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>

        {/* Alternador de Modo */}
        <div className="flex items-center bg-[#0b0d12] p-0.5 rounded-lg border border-[#1e2533]">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors ${
              mode === "file"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            Upload Local
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors ${
              mode === "url"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            URL / Link
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-800/60">
          {error}
        </p>
      )}

      {/* Se já tiver imagem selecionada */}
      {value ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#1e2533] bg-[#0b0d12] group">
          <img
            src={value}
            alt="Preview da capa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Trocar Imagem
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Capa Definida
          </div>
        </div>
      ) : (
        <>
          {mode === "file" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#232d42] hover:border-blue-500/60 bg-[#0b0d12] hover:bg-[#11141c] rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center space-y-2 py-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-xs font-medium text-slate-300">
                    Processando e salvando imagem...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#182030] text-blue-400 flex items-center justify-center border border-[#232d42]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Clique para escolher do computador
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ou arraste o arquivo aqui (PNG, JPG, WebP ou GIF)
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://sua-imagem.com/capa.jpg"
                className="w-full px-3 py-2 bg-[#0b0d12] border border-[#1e2533] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </>
      )}

      {/* Hidden input for changing image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
