"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

type AiChatOptionsProps = {
  options: string[];
  originalDraft: string;
  onSelect: (option: string, wasRewritten: boolean) => void;
  onClose: () => void;
  className?: string;
};

export function AiChatOptions({
  options,
  originalDraft,
  onSelect,
  onClose,
  className,
}: AiChatOptionsProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (option: string) => {
    setEditing(option);
    setEditValue(option);
  };

  return (
    <div className={cn("border-t border-brand-100 bg-brand-50/40 px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-800">AI rewrite options</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-brand-600">
          Close
        </Button>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <Card key={index} className="border-brand-200 bg-white shadow-sm">
            <CardContent className="p-3">
              {editing === option ? (
                <div className="space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={3}
                    className="border-brand-200"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700"
                      onClick={() => {
                        onSelect(editValue.trim(), true);
                        onClose();
                      }}
                      disabled={!editValue.trim()}
                    >
                      Send edited
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-foreground">{option}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700"
                      onClick={() => onSelect(option, true)}
                    >
                      Send this
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-brand-200"
                      onClick={() => startEdit(option)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Button
          variant="secondary"
          className="w-full bg-white text-brand-800 ring-1 ring-brand-200"
          onClick={() => onSelect(originalDraft, false)}
        >
          Send as-is
        </Button>
      </div>
    </div>
  );
}
