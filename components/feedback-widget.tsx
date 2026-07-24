"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendFeedback } from "@/app/actions";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();

  function handleSend() {
    startTransition(async () => {
      const result = await sendFeedback(message, pathname);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Thanks for the feedback!");
      setMessage("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg"
          aria-label="Send feedback"
        >
          <MessageCircleQuestion className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Got feedback or a suggestion?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea
            rows={5}
            placeholder="Tell us what's working, what's not, or what you'd like to see..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleSend} disabled={pending || !message.trim()}>
            {pending ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
