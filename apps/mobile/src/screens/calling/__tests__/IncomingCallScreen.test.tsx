import React from 'react';
import {  } from '@testing-library/react-native';
import {  } from 'react-native';
import IncomingCallScreen from '../IncomingCallScreen';

// Mock dependencies
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  Animated: {
    ...jest.requireActual('react-native').Animated,
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    timing: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => 0),
    })),
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

const mockCallData = {
  callId: 'test-call-id',
  matchId: 'test-match-id',
  callerId: 'test-caller-id',
  callerName: 'Test Caller',
  callerAvatar: 'https://example.com/avatar.jpg',
  callType: 'voice' as const,
  timestamp: Date.now(),
};

describe('IncomingCallScreen', () => {
  const mockOnAnswer = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with call data', () => {
    const { getByText } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Incoming Call')).toBeTruthy();
    expect(getByText('Voice Call')).toBeTruthy();
    expect(getByText('Test Caller')).toBeTruthy();
    expect(getByText('PawfectMatch')).toBeTruthy();
  });

  it('should display video call type correctly', () => {
    const videoCallData = { ...mockCallData, callType: 'video' as const };
    
    const { getByText } = render(
      <IncomingCallScreen
        callData={videoCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Video Call')).toBeTruthy();
  });

  it('should start vibration on mount', () => {
    render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 1000, 500, 1000, 500], true);
  });

  it('should cancel vibration on unmount', () => {
    const { unmount } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    unmount();

    expect(Vibration.cancel).toHaveBeenCalled();
  });

  it('should call onAnswer when answer button is pressed', () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    // Find answer button by looking for the call icon
    const answerButton = getByTestId('answer-button') || 
      getByText('call'); // Fallback to icon text if testID not found

    fireEvent.press(answerButton);

    expect(Vibration.cancel).toHaveBeenCalled();
    expect(mockOnAnswer).toHaveBeenCalled();
  });

  it('should call onReject when reject button is pressed', () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    // Find reject button by looking for the rotated call icon
    const rejectButton = getByTestId('reject-button') || 
      getByText('call'); // Fallback to icon text if testID not found

    fireEvent.press(rejectButton);

    expect(Vibration.cancel).toHaveBeenCalled();
    expect(mockOnReject).toHaveBeenCalled();
  });

  it('should render default avatar when no avatar provided', () => {
    const callDataWithoutAvatar = { ...mockCallData, callerAvatar: undefined };
    
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={callDataWithoutAvatar}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    // Check if default avatar is rendered
    const avatar = getByTestId('caller-avatar');
    expect(avatar).toBeTruthy();
  });

  it('should handle animations correctly', async () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    // Wait for animations to start
    await waitFor(() => {
      expect(getByTestId('incoming-call-container')).toBeTruthy();
    });

    // Animations should be set up (mocked functions should be called)
    expect(require('react-native').Animated.loop).toHaveBeenCalled();
    expect(require('react-native').Animated.timing).toHaveBeenCalled();
  });

  it('should format call type correctly', () => {
    const { rerender, getByText } = render(
      <IncomingCallScreen
        callData={{ ...mockCallData, callType: 'voice' }}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Voice Call')).toBeTruthy();

    rerender(
      <IncomingCallScreen
        callData={{ ...mockCallData, callType: 'video' }}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Video Call')).toBeTruthy();
  });

  it('should render additional action buttons', () => {
    const { getByText } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Message')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('should apply correct styles for different call states', () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />
    );

    const container = getByTestId('incoming-call-container');
    expect(container).toHaveStyle({
      flex: 1,
      backgroundColor: '#000',
    });
  });
});
