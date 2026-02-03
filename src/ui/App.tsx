import React, { useRef } from 'react';
import { useFigmaData } from './hooks/useFigmaData';
import { PreviewHeader } from './components/PreviewHeader';
import { HeaderActions } from './components/HeaderActions';
import { PropertyCategory } from './components/PropertyCategory';
import { PropertyButton } from './components/PropertyButton';
import './App.css';

export const App: React.FC = () => {
  const { data, supportedGranules } = useFigmaData();

  const onPaste = (granules: string[]) => {
    parent.postMessage(
      { pluginMessage: { type: 'PASTE_PROPERTY', granules } },
      '*'
    );
  };

  const isAvailable = (granules: string[]) => {
    if (!data) return false;
    // Available if data has ANY of the granules AND selection supports ANY of them
    const hasData = granules.some((g) => g in data);
    const hasSupport = granules.some((g) => supportedGranules.includes(g));
    return hasData && hasSupport;
  };

  // use refs for mutable values to avoid re-renders during drag
  const rafRef = React.useRef<number>(0);
  const nextHeightRef = React.useRef<number | null>(null);

  const onResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const startY = e.clientY;
    const startHeight = document.documentElement.clientHeight;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.round(Math.max(300, startHeight + deltaY));

      // Throttle with RAF
      nextHeightRef.current = newHeight;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          if (nextHeightRef.current !== null) {
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'RESIZE_UI',
                  width: window.innerWidth,
                  height: nextHeightRef.current,
                },
              },
              '*'
            );
            nextHeightRef.current = null;
          }
        });
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = 'auto';

      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      // Save the final size
      const deltaY = upEvent.clientY - startY;
      const finalHeight = Math.round(Math.max(300, startHeight + deltaY));
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SAVE_UI_SIZE',
            width: window.innerWidth,
            height: finalHeight,
          },
        },
        '*'
      );
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
    document.body.style.cursor = 'ns-resize';
  };

  return (
    <div className='app'>
      <HeaderActions />
      <PreviewHeader
        name={data?.name}
        id={data?.id}
        ancestors={data?.ancestors}
        preview={data?.preview}
      />

      <div className='scroll-container'>
        <PropertyCategory title='Visuals'>
          <PropertyButton
            label='Fills'
            granules={['fills']}
            available={isAvailable(['fills'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Strokes'
            granules={[
              'strokes',
              'strokeWeight',
              'strokeAlign',
              'dashPattern',
              'strokeCap',
              'strokeJoin',
              'strokeMiterLimit',
            ]}
            available={isAvailable(['strokes'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Effects'
            granules={['effects']}
            available={isAvailable(['effects'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Opacity'
            granules={['opacity']}
            available={isAvailable(['opacity'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Corner Radius'
            granules={[
              'cornerRadius',
              'topLeftRadius',
              'topRightRadius',
              'bottomLeftRadius',
              'bottomRightRadius',
            ]}
            available={isAvailable(['cornerRadius'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Blend Mode'
            granules={['blendMode']}
            available={isAvailable(['blendMode'])}
            onPaste={onPaste}
          />
        </PropertyCategory>

        <PropertyCategory title='Layout'>
          <PropertyButton
            label='Position'
            granules={['x', 'y']}
            available={isAvailable(['x', 'y'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Size'
            granules={['width', 'height']}
            available={isAvailable(['width', 'height'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Auto Layout'
            granules={[
              'paddingLeft',
              'paddingRight',
              'paddingTop',
              'paddingBottom',
              'itemSpacing',
              'primaryAxisAlignItems',
              'counterAxisAlignItems',
              'layoutMode',
              'layoutWrap',
            ]}
            available={isAvailable(['layoutMode'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Constraints'
            granules={['constraints']}
            available={isAvailable(['constraints'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Grids'
            granules={['layoutGrids']}
            available={isAvailable(['layoutGrids'])}
            onPaste={onPaste}
          />
        </PropertyCategory>

        <PropertyCategory title='Content'>
          <PropertyButton
            label='Text Content'
            granules={['characters']}
            available={isAvailable(['characters'])}
            onPaste={onPaste}
          />
          <PropertyButton
            label='Text Styles'
            granules={[
              'textStyleId',
              'fontName',
              'fontSize',
              'lineHeight',
              'letterSpacing',
              'paragraphSpacing',
              'paragraphIndent',
              'textCase',
              'textDecoration',
            ]}
            available={isAvailable(['textStyleId', 'fontSize'])}
            onPaste={onPaste}
          />
        </PropertyCategory>

        <PropertyCategory title='Misc'>
          <PropertyButton
            label='Export Settings'
            granules={['exportSettings']}
            available={isAvailable(['exportSettings'])}
            onPaste={onPaste}
          />
        </PropertyCategory>
      </div>

      <div className='footer'>
        <button
          type='button'
          className='paste-all-button'
          onClick={() => onPaste(['all'])}
        >
          Paste All
        </button>
      </div>
      <div className='resize-handle' onPointerDown={onResizeStart} />
    </div>
  );
};
