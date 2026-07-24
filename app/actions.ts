"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

interface FeedbackResult {
  error?: string;
}

export async function sendFeedback(
  message: string,
  pageUrl: string
): Promise<FeedbackResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { error: "Please write a message before sending." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!apiKey || !to) {
    return { error: "Feedback isn't configured yet." };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Property Manager Feedback <onboarding@resend.dev>",
    to,
    subject: "New feedback from Property Manager",
    text: `${trimmed}\n\nSent from: ${pageUrl}`,
  });

  if (error) {
    return { error: "Couldn't send feedback right now. Try again later." };
  }

  return {};
}
