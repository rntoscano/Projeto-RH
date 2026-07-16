import { ImageSquare, Trash, UserCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { PHOTO_INPUT_ACCEPT, readPhotoFile } from '../../utils/photoUpload';

interface PhotoPickerProps {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
  helperText?: string;
}

function PhotoPicker({ id, label, value, onChange, onError, helperText }: PhotoPickerProps) {
  const [failedPreviewValue, setFailedPreviewValue] = useState('');
  const showPreview = Boolean(value) && failedPreviewValue !== value;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const photo = await readPhotoFile(file);
      onChange(photo);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Não foi possível adicionar a foto.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4 sm:flex-row sm:items-center">
        {showPreview ? (
          <img
            src={value}
            alt="Prévia da foto selecionada"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-ekoa-purple-100"
            onError={() => setFailedPreviewValue(value ?? '')}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ekoa-purple-50 text-ekoa-purple-600 ring-4 ring-ekoa-purple-100">
            <UserCircle size={54} aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label
              htmlFor={id}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ekoa-purple-700 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ekoa-purple-600"
            >
              <ImageSquare size={20} aria-hidden="true" />
              Escolher foto
            </label>
            <input id={id} type="file" accept={PHOTO_INPUT_ACCEPT} onChange={handleFileChange} className="sr-only" />

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <Trash size={18} aria-hidden="true" />
                Remover foto
              </button>
            )}
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {helperText ?? 'Escolha uma imagem JPG, PNG ou WebP. A foto é ajustada automaticamente antes de salvar.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PhotoPicker;
