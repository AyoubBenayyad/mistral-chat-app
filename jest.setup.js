import '@testing-library/jest-dom';

// Add web streams polyfill for tests
import { ReadableStream, TextEncoder } from 'node:stream/web';
import { TextDecoder } from 'node:util';

global.ReadableStream = ReadableStream;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;