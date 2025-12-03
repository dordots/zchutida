import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export default function FileUploadField({ label, required, fileUrl, onUpload, description }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="border-emerald-200 hover:bg-emerald-50"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מעלה...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  העלה קובץ
                </>
              )}
            </span>
          </Button>
        </label>

        {fileUrl && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <FileText className="w-4 h-4" />
              הקובץ הועלה
            </a>
          </div>
        )}
      </div>
    </div>
  );
}