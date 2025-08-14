import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import "@testing-library/jest-dom";
import { vi } from "vitest";

// ทำให้การ import "server-only" เงียบ ไม่โยน Error ในเทสต์
vi.mock("server-only", () => ({}));

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
