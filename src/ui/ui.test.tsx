/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from './App';

describe('UI', () => {

  it('should render the copy button', () => {
    render(<App />);
    expect(screen.getByText('Copy Selection')).toBeDefined();
  });

});

