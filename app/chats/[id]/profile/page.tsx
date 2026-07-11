"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContactProfilePage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [toneNotes, setToneNotes] = useState("");
  const [noSendRules, setNoSendRules] = useState("");
  const [relationshipNotes, setRelationshipNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);
      const response = await fetch(`/api/contacts/${conversationId}`);
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error ?? "Failed to load contact");
        return;
      }

      const contact = data.contact as Contact | null;
      if (contact) {
        setToneNotes(contact.tone_notes ?? "");
        setNoSendRules(contact.no_send_rules ?? "");
        setRelationshipNotes(contact.relationship_notes ?? "");
      }
    };

    void loadContact();
  }, [conversationId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/contacts/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toneNotes,
        noSendRules,
        relationshipNotes,
      }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to save");
      return;
    }

    setMessage("Contact rules saved. Replai will use these on the next AI check.");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-gradient-brand-subtle px-4 py-6">
      <Link
        href={`/chats/${conversationId}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <ChevronLeft className="size-4" />
        Back to chat
      </Link>

      <Card className="mt-4 border-brand-100 shadow-brand">
        <CardHeader>
          <CardTitle>Contact rules</CardTitle>
          <CardDescription>
            Tell Replai how to rewrite for this person — tone, timing, and relationship
            context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tone notes
                </label>
                <Textarea
                  value={toneNotes}
                  onChange={(e) => setToneNotes(e.target.value)}
                  placeholder="Keep it warm but not flirty. Short sentences."
                  rows={3}
                  className="border-brand-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  No-send rules
                </label>
                <Textarea
                  value={noSendRules}
                  onChange={(e) => setNoSendRules(e.target.value)}
                  placeholder="No drunk texts after 9pm. No work talk after 6pm."
                  rows={3}
                  className="border-brand-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Relationship notes
                </label>
                <Textarea
                  value={relationshipNotes}
                  onChange={(e) => setRelationshipNotes(e.target.value)}
                  placeholder="Manager. Keep it professional. They prefer async."
                  rows={3}
                  className="border-brand-200"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-brand-600 hover:bg-brand-700"
              >
                {saving ? "Saving..." : "Save rules"}
              </Button>
              {message && <p className="text-sm text-brand-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
