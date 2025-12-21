"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Render } from "@/components/Render";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setDetails([]);
    }
  };

  const handleDisplayDetails = (details: any[]) => {
    // If details are strings, use them. If objects, stringify.
    if (Array.isArray(details)) {
      return details.map((d) =>
        typeof d === "string" ? d : JSON.stringify(d)
      );
    }
    return [];
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setDetails([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        if (data.details) {
          setDetails(handleDisplayDetails(data.details));
        }
      } else {
        // Success
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Financial Data Upload
          </h1>
          <p className="text-slate-500 mt-2">
            Upload your transaction CSV to view analytics
          </p>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <Render if={!!file}>
              <div className="flex flex-col items-center">
                <FileText className="w-10 h-10 text-indigo-500 mb-2" />
                <span className="font-medium text-slate-700">{file?.name}</span>
                <span className="text-sm text-slate-400">
                  {(file?.size ?? 0 / 1024).toFixed(1)} KB
                </span>
              </div>
            </Render>

            <Render if={!file}>
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-slate-300 mb-2" />
                <span className="font-medium text-slate-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-slate-400">CSV files only</span>
              </div>
            </Render>
          </div>

          <Render if={!!error}>
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex flex-col gap-2 text-sm border border-red-100">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
              {details.length > 0 && (
                <ul className="list-disc list-inside space-y-1 ml-1 text-red-600 max-h-40 overflow-y-auto">
                  {details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </Render>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2",
              !file || isUploading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload and Process"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
