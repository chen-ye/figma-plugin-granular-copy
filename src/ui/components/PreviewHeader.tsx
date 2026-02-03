import { useEffect, useState } from 'react';

interface PreviewHeaderProps {
  id?: string;
  name?: string;
  ancestors?: { name: string; id: string }[];
  preview?: Uint8Array | number[] | null;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  id,
  name,
  ancestors,
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
      blob = new Blob([new Uint8Array(preview) as unknown as BlobPart], {
        type: 'image/png',
      });
    }

    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [preview]);

  const onSelectNode = (id: string) => {
    parent.postMessage({ pluginMessage: { type: 'SELECT_NODE', id } }, '*');
  };

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
        {ancestors && ancestors.length > 0 && (
          <span className='ancestor-path'>
            {ancestors.map((ancestor, index) => (
              <span key={ancestor.id}>
                <button
                  type='button'
                  className='path-segment'
                  onClick={() => onSelectNode(ancestor.id)}
                >
                  {ancestor.name}
                </button>
                {' / '}
              </span>
            ))}
          </span>
        )}
        <span className='node-name'>
          {id ? (
            <button
              type='button'
              className='path-segment'
              onClick={() => onSelectNode(id)}
            >
              {name || 'No selection'}
            </button>
          ) : (
            name || 'No selection'
          )}
        </span>
      </div>
    </div>
  );
};
