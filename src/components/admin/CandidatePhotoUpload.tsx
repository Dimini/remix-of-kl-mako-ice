import { useRef, useState } from "react";
import { Upload, Trash2, Loader2, User2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Photo upload to the public `candidate-photos` Supabase Storage bucket.
// File path: {candidateId}/{timestamp}.{ext}
// Returns the resulting public URL via onChange so the parent form can save
// it into candidates.photo_url.
// ---------------------------------------------------------------------------

const BUCKET = "candidate-photos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  candidateId: string | null; // null when creating a new candidate (disables upload)
  value: string | undefined;
  onChange: (url: string) => void;
}

export function CandidatePhotoUpload({ candidateId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!candidateId) {
      toast({
        title: "Najprv uložte kandidáta",
        description: "Fotografiu môžete nahrať až po prvom uložení.",
        variant: "destructive",
      });
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast({
        title: "Nepodporovaný formát",
        description: "Povolené: JPG, PNG, WEBP.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({
        title: "Súbor je príliš veľký",
        description: "Maximum 5 MB.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${candidateId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) {
      setBusy(false);
      toast({
        title: "Chyba pri nahrávaní",
        description: upErr.message,
        variant: "destructive",
      });
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
    toast({ title: "Fotografia nahraná" });
  }

  function clearPhoto() {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {value ? (
            <img
              src={value}
              alt="Náhľad fotografie"
              className="h-24 w-24 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border">
              <User2 className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            disabled={busy || !candidateId}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy || !candidateId}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}
              Nahrať fotografiu
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearPhoto}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Odstrániť
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG alebo WEBP, max. 5 MB.{" "}
            {!candidateId && (
              <span className="italic">Najprv uložte nového kandidáta.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
