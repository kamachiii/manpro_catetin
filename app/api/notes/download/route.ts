import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

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

    // 1. Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu untuk mengunduh catatan" },
        { status: 401 }
      );
    }

    // 2. Fetch note status
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

    // Enforce that only approved notes can be downloaded
    if (note.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Catatan ini tidak dapat diunduh karena belum disetujui admin" },
        { status: 403 }
      );
    }

    // 3. Call database handle_note_download RPC to charge coins and register download
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "handle_note_download",
      {
        p_user_id: user.id,
        p_note_id: noteId,
      }
    );

    if (rpcError) {
      console.error("RPC handle_note_download error:", rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 500 }
      );
    }

    // Explicit type casting for RPC JSON response
    const resObj = rpcData as { success: boolean; message: string; file_path?: string };

    if (!resObj.success || !resObj.file_path) {
      return NextResponse.json(
        { success: false, error: resObj.message || "Gagal memproses unduhan koin" },
        { status: 400 }
      );
    }

    // 4. Retrieve user's remaining coin balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("coin_balance")
      .eq("id", user.id)
      .single();

    // 5. Generate signed URL for the private note file
    const { data: signData, error: signError } = await supabase.storage
      .from("notes-files")
      .createSignedUrl(resObj.file_path, 60); // 60 seconds expiry

    if (signError || !signData?.signedUrl) {
      console.error("Error generating signed url:", signError);
      return NextResponse.json(
        { success: false, error: "Gagal mengunduh file dari secure storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signData.signedUrl,
      remainingCoins: profile?.coin_balance ?? 0,
      message: resObj.message,
    });
  } catch (error: unknown) {
    console.error("Secure download API catch error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
