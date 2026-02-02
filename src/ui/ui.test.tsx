/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from './ui';

describe('UI', () => {
  it('should render the title', () => {
    render(<App />);
    expect(screen.getByText('Granular Copy UI')).toBeDefined();
  });
});

