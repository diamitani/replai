"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Contact, PrivateDraftWithSent } from "@/lib/types";
import { ChevronLeft, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

  const [sharingWithThem, setSharingWithThem] = useState(false);
  const [theySharingWithMe, setTheySharingWithMe] = useState(false);
  const [shareSaving, setShareSaving] = useState(false);
  const [myDrafts, setMyDrafts] = useState<PrivateDraftWithSent[]>([]);
  const [sharedDrafts, setSharedDrafts] = useState<PrivateDraftWithSent[]>([]);

  const loadShareAndDrafts = useCallback(async () => {
    const [shareRes, draftsRes] = await Promise.all([
      fetch(`/api/conversations/${conversationId}/draft-share`),
      fetch(`/api/conversations/${conversationId}/drafts`),
    ]);

    if (shareRes.ok) {
      const shareData = await shareRes.json();
      setSharingWithThem(Boolean(shareData.sharingWithThem));
      setTheySharingWithMe(Boolean(shareData.theySharingWithMe));
    }

    if (draftsRes.ok) {
      const draftsData = await draftsRes.json();
      setMyDrafts(draftsData.mine ?? []);
      setSharedDrafts(draftsData.sharedWithMe ?? []);
    }
  }, [conversationId]);

  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);
      const response = await fetch(`/api/contacts/${conversationId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to load contact");
        setLoading(false);
        return;
      }

      const contact = data.contact as Contact | null;
      if (contact) {
        setToneNotes(contact.tone_notes ?? "");
        setNoSendRules(contact.no_send_rules ?? "");
        setRelationshipNotes(contact.relationship_notes ?? "");
      }

      await loadShareAndDrafts();
      setLoading(false);
    };

    void loadContact();
  }, [conversationId, loadShareAndDrafts]);

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

  const handleToggleShare = async () => {
    setShareSaving(true);
    setError(null);
    const next = !sharingWithThem;

    const response = await fetch(`/api/conversations/${conversationId}/draft-share`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });

    const data = await response.json();
    setShareSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to update share");
      return;
    }

    setSharingWithThem(Boolean(data.sharingWithThem));
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

      <Card className="mt-4 border-brand-100 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4 text-brand-600" />
            Original drafts
          </CardTitle>
          <CardDescription>
            When you send an AI rewrite, your real draft stays private. Only you can see
            it — unless you share.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-xl bg-brand-50/80 px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Share my originals with them
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lets them tap &quot;What they really typed&quot; on your rewritten messages.
              </p>
              {theySharingWithMe && (
                <p className="mt-1.5 text-xs font-medium text-brand-700">
                  They&apos;ve shared their originals with you.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={shareSaving || loading}
              onClick={() => void handleToggleShare()}
              className={
                sharingWithThem
                  ? "shrink-0 border-brand-300 bg-brand-100 text-brand-800"
                  : "shrink-0 border-brand-200 text-brand-700"
              }
            >
              {sharingWithThem ? (
                <>
                  <Eye className="size-3.5" />
                  Sharing
                </>
              ) : (
                <>
                  <EyeOff className="size-3.5" />
                  Private
                </>
              )}
            </Button>
          </div>

          {myDrafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved originals yet. Use AI Check, pick a rewrite, and your draft will
              land here.
            </p>
          ) : (
            <ul className="space-y-3">
              {myDrafts.map((draft) => (
                <li
                  key={draft.id}
                  className="rounded-xl border border-brand-100 bg-white px-3 py-2.5 text-sm"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    What you typed
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-800">
                    {draft.original_text}
                  </p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-brand-600">
                    What you sent
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-600">
                    {draft.sent_content}
                  </p>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {new Date(draft.sent_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {sharedDrafts.length > 0 && (
            <div className="border-t border-brand-100 pt-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Shared with you
              </p>
              <ul className="space-y-3">
                {sharedDrafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      What they typed
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-zinc-800">
                      {draft.original_text}
                    </p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-brand-600">
                      What they sent
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-zinc-600">
                      {draft.sent_content}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
