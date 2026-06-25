import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteIdStr = searchParams.get("noteId");

    if (!noteIdStr) {
      return NextResponse.json(
        { success: false, error: "ID catatan wajib disertakan" },
        { status: 400 }
      );
    }

    const noteId = parseInt(noteIdStr, 10);
    if (isNaN(noteId)) {
      return NextResponse.json(
        { success: false, error: "ID catatan tidak valid" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 1. Fetch note details (make sure it's approved)
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("status, file_path")
      .eq("id", noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { success: false, error: "Catatan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (note.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Catatan ini belum disetujui untuk dipratinjau" },
        { status: 403 }
      );
    }

    // 2. Download original PDF from Supabase storage (using admin client to bypass storage RLS on server)
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from("notes-files")
      .download(note.file_path);

    if (downloadError || !fileBlob) {
      console.error("Error downloading file from storage for preview:", downloadError);
      
      const isNotFound = downloadError && (
        (downloadError as any).status === 404 || 
        (downloadError as any).statusCode === '404' ||
        (downloadError as any).status === 400 || // Some clients return 400 with Object not found
        downloadError.message?.includes("Object not found")
      );

      if (isNotFound) {
        const fallbackDoc = await PDFDocument.create();
        const page = fallbackDoc.addPage([595, 842]); // A4 Size
        const fontBold = await fallbackDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await fallbackDoc.embedFont(StandardFonts.Helvetica);
        
        page.drawText("Pratinjau Tidak Tersedia", {
          x: 160,
          y: 500,
          size: 24,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        
        page.drawText("Dokumen ini adalah data contoh (seed) yang tidak memiliki berkas fisik di storage.", {
          x: 80,
          y: 450,
          size: 11,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        page.drawText("Hanya catatan asli yang diunggah oleh pengguna yang dapat dipratinjau.", {
          x: 95,
          y: 430,
          size: 11,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });
        
        const previewPdfBytes = await fallbackDoc.save();
        return new Response(previewPdfBytes as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline; filename=preview-unavailable.pdf",
            "Cache-Control": "no-cache",
          },
        });
      }

      return NextResponse.json(
        { success: false, error: `Gagal mengunduh file dari storage: ${downloadError?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    // 3. Process PDF using pdf-lib to extract only the first page
    const fileArrayBuffer = await fileBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileArrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      return NextResponse.json(
        { success: false, error: "File PDF kosong atau tidak valid" },
        { status: 400 }
      );
    }

    // Create a new PDF document consisting of only the first page
    const previewDoc = await PDFDocument.create();
    const [firstPage] = await previewDoc.copyPages(pdfDoc, [0]);
    previewDoc.addPage(firstPage);
    const previewPdfBytes = await previewDoc.save();

    // 4. Return the 1-page PDF stream
    return new Response(previewPdfBytes as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=preview.pdf",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error("PDF Preview generation error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
