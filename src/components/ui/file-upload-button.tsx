import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadButtonProps {
  accept?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
  label?: string;
  /** Currently selected file — when provided, displays filename + size and a clear button. */
  file?: File | null;
  className?: string;
  id?: string;
}

export interface FileUploadButtonHandle {
  reset: () => void;
}

/**
 * Friendly file-picker that renders as a real button instead of the raw
 * browser file input. The underlying <input type="file"> is visually hidden
 * but kept in the DOM for accessibility and form semantics.
 */
export const FileUploadButton = forwardRef<FileUploadButtonHandle, FileUploadButtonProps>(
  function FileUploadButton(
    { accept, disabled, onChange, label = "Vybrať súbor", file, className, id },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalFile, setInternalFile] = useState<File | null>(null);
    const currentFile = file !== undefined ? file : internalFile;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (inputRef.current) inputRef.current.value = "";
        setInternalFile(null);
      },
    }));

    function clear() {
      if (inputRef.current) inputRef.current.value = "";
      setInternalFile(null);
      onChange(null);
    }

    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setInternalFile(f);
            onChange(f);
          }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            {currentFile ? "Vybrať iný súbor" : label}
          </Button>
          {currentFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={clear}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Odstrániť
            </Button>
          )}
        </div>
        {currentFile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {currentFile.name}{" "}
              <span className="text-muted-foreground/70">
                ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </span>
          </div>
        )}
      </div>
    );
  },
);
