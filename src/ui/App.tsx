import React from 'react';
import { useFigmaData } from './hooks/useFigmaData';
import { PreviewHeader } from './components/PreviewHeader';
import { HeaderActions } from './components/HeaderActions';
import { PropertyCategory } from './components/PropertyCategory';
import { PropertyButton } from './components/PropertyButton';
import './App.css';

export const App: React.FC = () => {

  const { data, supportedGranules } = useFigmaData();

  const onPaste = (granules: string[]) => {
    parent.postMessage({ pluginMessage: { type: 'PASTE_PROPERTY', granules } }, '*');
  };

  const isAvailable = (granules: string[]) => {
    if (!data) return false;
    // Available if data has ANY of the granules AND selection supports ANY of them
    const hasData = granules.some(g => g in data);
    const hasSupport = granules.some(g => supportedGranules.includes(g));
    return hasData && hasSupport;
  };

  return (
    <div className="app">
      <HeaderActions />
      <PreviewHeader name={data?.name} preview={data?.preview} />
      
      <div className="scroll-container">
        <PropertyCategory title="Visuals">
          <PropertyButton label="Fills" granules={['fills']} available={isAvailable(['fills'])} onPaste={onPaste} />
          <PropertyButton label="Strokes" granules={['strokes', 'strokeWeight', 'strokeAlign', 'dashPattern', 'strokeCap', 'strokeJoin', 'strokeMiterLimit']} available={isAvailable(['strokes'])} onPaste={onPaste} />
          <PropertyButton label="Effects" granules={['effects']} available={isAvailable(['effects'])} onPaste={onPaste} />
          <PropertyButton label="Opacity" granules={['opacity']} available={isAvailable(['opacity'])} onPaste={onPaste} />
          <PropertyButton label="Corner Radius" granules={['cornerRadius', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']} available={isAvailable(['cornerRadius'])} onPaste={onPaste} />
          <PropertyButton label="Blend Mode" granules={['blendMode']} available={isAvailable(['blendMode'])} onPaste={onPaste} />
        </PropertyCategory>

        <PropertyCategory title="Layout">
          <PropertyButton label="Position" granules={['x', 'y']} available={isAvailable(['x', 'y'])} onPaste={onPaste} />
          <PropertyButton label="Size" granules={['width', 'height']} available={isAvailable(['width', 'height'])} onPaste={onPaste} />
          <PropertyButton label="Auto Layout" granules={['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'layoutMode', 'layoutWrap']} available={isAvailable(['layoutMode'])} onPaste={onPaste} />
          <PropertyButton label="Constraints" granules={['constraints']} available={isAvailable(['constraints'])} onPaste={onPaste} />
          <PropertyButton label="Grids" granules={['layoutGrids']} available={isAvailable(['layoutGrids'])} onPaste={onPaste} />
        </PropertyCategory>

        <PropertyCategory title="Content">
          <PropertyButton label="Text Content" granules={['characters']} available={isAvailable(['characters'])} onPaste={onPaste} />
          <PropertyButton label="Text Styles" granules={['textStyleId', 'fontName', 'fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing', 'paragraphIndent', 'textCase', 'textDecoration']} available={isAvailable(['textStyleId', 'fontSize'])} onPaste={onPaste} />
        </PropertyCategory>

        <PropertyCategory title="Misc">
          <PropertyButton label="Export Settings" granules={['exportSettings']} available={isAvailable(['exportSettings'])} onPaste={onPaste} />
        </PropertyCategory>
      </div>

      <div className="footer">
        <button className="paste-all-button" onClick={() => onPaste(['all'])}>
          Paste All
        </button>
      </div>
    </div>
  );
};
