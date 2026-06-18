"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

interface TopupRequestInput {
  amount: number;
  coinAmount: number;
  paymentMethod: string;
  proofImage: string;
}

export async function submitTopupRequest(input: TopupRequestInput) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (input.amount <= 0 || input.coinAmount <= 0) {
      return { success: false, error: "Nominal top up tidak valid" };
    }
    if (!input.paymentMethod) {
      return { success: false, error: "Metode pembayaran wajib dipilih" };
    }
    if (!input.proofImage) {
      return { success: false, error: "Bukti transfer pembayaran wajib diunggah" };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("topups").insert({
      user_id: user.id,
      amount: input.amount,
      coin_amount: input.coinAmount,
      payment_method: input.paymentMethod,
      proof_image: input.proofImage,
      status: "pending", // Default to pending
    });

    if (error) {
      console.error("Error creating topup request:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/coins");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
