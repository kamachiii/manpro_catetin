"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadNoteAction } from "@/lib/actions/notes";
import { FileText, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Combobox from "@/components/ui/combobox";

interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Semester {
  id: number;
  name: string;
}

interface UploadNoteFormProps {
  userId: string;
  categories: Category[];
  courses: Course[];
  semesters: Semester[];
}

export default function UploadNoteForm({
  userId,
  categories,
  courses,
  semesters,
}: UploadNoteFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<string | null>(null);
  const [semesterId, setSemesterId] = useState("");
  const [coinPrice, setCoinPrice] = useState("3");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status & drag states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // File validation helper
  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side validation: must be PDF
    if (file.type !== "application/pdf") {
      setErrorMsg("File harus berupa dokumen PDF (.pdf)");
      setSelectedFile(null);
      return;
    }

    // Client-side validation: max 20MB
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSizeBytes) {
      setErrorMsg("Ukuran file tidak boleh melebihi 20MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form validation
    if (!title.trim()) {
      setErrorMsg("Judul catatan wajib diisi");
      return;
    }
    if (selectedCategoryIds.length === 0 && newCategories.length === 0) {
      setErrorMsg("Silakan pilih atau tambahkan minimal satu kategori catatan");
      return;
    }
    if (selectedCourseId === null && (!newCourse || !newCourse.trim())) {
      setErrorMsg("Silakan pilih atau isi mata kuliah catatan");
      return;
    }
    if (!semesterId) {
      setErrorMsg("Silakan pilih semester");
      return;
    }
    const parsedCoinPrice = parseInt(coinPrice, 10);
    if (isNaN(parsedCoinPrice) || parsedCoinPrice < 1 || parsedCoinPrice > 10) {
      setErrorMsg("Harga koin harus berada di antara 1 dan 10 koin");
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Silakan pilih atau seret file PDF catatan kuliah Anda");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // 1. Upload file to Supabase private storage 'notes-files'
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `notes/${userId}/${Date.now()}-${cleanFileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
          .from("notes-files")
          .upload(storagePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(70);

      // 2. Call Server Action to store note metadata in notes table
      const res = await uploadNoteAction({
        title,
        description,
        categoryIds: selectedCategoryIds,
        newCategories: newCategories,
        courseId: selectedCourseId,
        newCourse: newCourse,
        semesterId: parseInt(semesterId, 10),
        filePath: storagePath,
        fileOriginalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        coinPrice: parsedCoinPrice,
      });

      setUploadProgress(100);

      if (res.success) {
        setSuccessMsg("Catatan berhasil diunggah dan sedang menunggu verifikasi admin!");
        setTimeout(() => {
          router.push("/dashboard/notes");
          router.refresh();
        }, 1500);
      } else {
        // Rollback: try to clean up uploaded file if DB insertion failed
        await supabase.storage.from("notes-files").remove([storagePath]);
        setErrorMsg(res.error || "Gagal menyimpan detail catatan.");
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error("Error uploading note:", error);
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah.";
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="upload-title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Judul Catatan <span className="text-destructive">*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rangkuman Lengkap Pemrograman Web - UTS..."
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="upload-desc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Deskripsi Materi
            </label>
            <textarea
              id="upload-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara singkat topik apa saja yang dibahas dalam catatan ini..."
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Kategori <span className="text-destructive">*</span>
              </label>
              <Combobox
                options={categories}
                placeholder="Pilih Kategori..."
                searchPlaceholder="Cari / Tambah Kategori..."
                emptyText="Ketik untuk menambahkan kategori baru."
                createNewLabel="Tambahkan Kategori"
                isMulti={true}
                selectedIds={selectedCategoryIds}
                onChangeMulti={(ids, newItems) => {
                  setSelectedCategoryIds(ids);
                  setNewCategories(newItems);
                }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Mata Kuliah <span className="text-destructive">*</span>
              </label>
              <Combobox
                options={courses}
                placeholder={newCourse ? newCourse : "Pilih Mata Kuliah..."}
                searchPlaceholder="Cari / Tambah Mata Kuliah..."
                emptyText="Ketik untuk menambahkan mata kuliah baru."
                createNewLabel="Tambahkan Mata Kuliah"
                isMulti={false}
                selectedId={selectedCourseId}
                onChangeSingle={(id, newItem) => {
                  setSelectedCourseId(id);
                  setNewCourse(newItem);
                }}
              />
            </div>

            <div>
              <label htmlFor="upload-semester" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Semester Materi <span className="text-destructive">*</span>
              </label>
              <select
                id="upload-semester"
                required
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="">Pilih Semester</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="upload-coin-price" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Harga Koin (1-10) <span className="text-destructive">*</span>
              </label>
              <input
                id="upload-coin-price"
                type="number"
                min="1"
                max="10"
                required
                value={coinPrice}
                onChange={(e) => setCoinPrice(e.target.value)}
                placeholder="3"
                className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* File Upload Field */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              File Dokumen (PDF) <span className="text-destructive">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/20 transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FileText className={`h-10 w-10 mb-3 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground/50"}`} />
              {selectedFile ? (
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-foreground truncate max-w-[250px] sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <label
                    htmlFor="note-file-input"
                    className="inline-block text-xs font-bold text-primary hover:underline mt-2 cursor-pointer"
                  >
                    Ganti File
                  </label>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Seret file PDF Anda ke sini, atau klik untuk memilih
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hanya menerima PDF. Ukuran maksimum 20MB.
                  </p>
                  <label
                    htmlFor="note-file-input"
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-all mt-2"
                  >
                    Pilih File PDF
                  </label>
                </div>
              )}
              <input
                id="note-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Progress bar if submitting */}
        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
              <span>Sedang mengunggah catatan...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                Mulai Upload
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
