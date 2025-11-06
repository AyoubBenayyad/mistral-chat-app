import { renderHook, act } from '@testing-library/react';
import { useChatOperations } from '../hooks/useChatOperations';

describe('useChatOperations', () => {
  const mockOnAddMessage = jest.fn();
  const mockOnUpdateMessage = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('sends user message and handles response', async () => {
    // Mock a successful response
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from('data: {"choices":[{"delta":{"content":"H"}}]}\n')
            })
            .mockResolvedValueOnce({
              done: false,
              value: Buffer.from('data: {"choices":[{"delta":{"content":"ello"}}]}\n')
            })
            .mockResolvedValueOnce({
              done: true
            }),
          releaseLock: jest.fn()
        })
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChatOperations({
      onAddMessage: mockOnAddMessage,
      onUpdateMessage: mockOnUpdateMessage,
      onError: mockOnError
    }));

    await act(async () => {
      await result.current.sendMessage('Hi', [], 'test-model');
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    await act(async () => {
      expect(mockOnAddMessage).toHaveBeenCalledWith({ role: 'user', content: 'Hi' });
      expect(mockOnAddMessage).toHaveBeenCalledWith({ role: 'assistant', content: '' });
      expect(mockOnUpdateMessage).toHaveBeenCalledTimes(2);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useChatOperations({
      onAddMessage: mockOnAddMessage,
      onUpdateMessage: mockOnUpdateMessage,
      onError: mockOnError
    }));

    await act(async () => {
      await result.current.sendMessage('Hi', [], 'test-model');
    });

    expect(mockOnError).toHaveBeenCalledWith('Network error');
  });

  it('should stop streaming when requested', async () => {
    const mockAbort = jest.fn();
    const mockController = { abort: mockAbort, signal: {} };
    (global as any).AbortController = jest.fn(() => mockController);

    const { result } = renderHook(() => useChatOperations({
      onAddMessage: mockOnAddMessage,
      onUpdateMessage: mockOnUpdateMessage,
      onError: mockOnError
    }));

    act(() => {
      result.current.sendMessage('Hi', [], 'test-model');
      result.current.stopStreaming();
    });

    expect(mockAbort).toHaveBeenCalled();
  });
});