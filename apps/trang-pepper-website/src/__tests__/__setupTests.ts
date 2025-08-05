import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import '@testing-library/jest-dom';

/*
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt, ...rest } = props;
    return React.createElement('img', { src, alt, ...rest });
  },
}));
*/
