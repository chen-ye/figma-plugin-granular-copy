import { useEffect, useState } from 'react';

interface PreviewHeaderProps {
  name: string;
  preview: Uint8Array | number[] | null;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  name,
  preview,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!preview) {
      setImageUrl(null);
      return;
    }

    let blob: Blob;

    if (preview instanceof Uint8Array) {
      blob = new Blob([preview as unknown as BlobPart], { type: 'image/png' });
    } else {
      // It might come in as a regular array from JSON serialization
      blob = new Blob([new Uint8Array(preview) as unknown as BlobPart], { type: 'image/png' });
    }

    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [preview]);

  return (
    <div className='preview-header'>
      <div className='preview-thumbnail'>
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className='preview-placeholder' />
        )}
      </div>
      <div className='preview-info'>
        <span className='node-name'>{name || 'No selection'}</span>
      </div>
    </div>
  );
};
