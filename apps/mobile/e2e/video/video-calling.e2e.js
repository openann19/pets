/**
 * Mobile Video Calling E2E Tests
 * Comprehensive testing of video calling and WebRTC functionality
 */

describe('Mobile Video Calling', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Video Call Initiation', () => {
    it('should display video call button in chat', async () => {
      await element(by.id('matches-tab')).tap();
      await expect(element(by.id('matches-screen'))).toBeVisible();
      
      await element(by.id('match-item-0')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      
      await expect(element(by.id('video-call-button'))).toBeVisible();
    });

    it('should initiate video call', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-initiating'))).toBeVisible();
      await expect(element(by.text('Calling...'))).toBeVisible();
    });

    it('should show call permissions request', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      
      // Should request camera and microphone permissions
      await expect(element(by.text('Camera permission required'))).toBeVisible();
      await expect(element(by.text('Microphone permission required'))).toBeVisible();
    });

    it('should handle permission denial', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      
      // Deny camera permission
      await element(by.id('deny-camera-permission')).tap();
      
      await expect(element(by.text('Camera permission denied'))).toBeVisible();
      await expect(element(by.text('Please enable camera access in settings'))).toBeVisible();
    });
  });

  describe('Incoming Video Call', () => {
    it('should display incoming call screen', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      await expect(element(by.text('Incoming video call'))).toBeVisible();
      await expect(element(by.text('John Doe'))).toBeVisible();
      await expect(element(by.text('Buddy'))).toBeVisible();
    });

    it('should accept incoming call', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      
      await element(by.id('accept-call-button')).tap();
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
    });

    it('should decline incoming call', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      
      await element(by.id('decline-call-button')).tap();
      await expect(element(by.id('incoming-call-screen'))).toBeNotVisible();
      await expect(element(by.text('Call declined'))).toBeVisible();
    });

    it('should show call duration while ringing', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      await expect(element(by.id('call-timer'))).toBeVisible();
      
      // Wait for timer to update
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('call-timer')).toHaveText('00:02'));
    });
  });

  describe('Active Video Call', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      // Simulate call connection
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should display video call interface', async () => {
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
      await expect(element(by.id('mute-button'))).toBeVisible();
      await expect(element(by.id('camera-toggle-button'))).toBeVisible();
      await expect(element(by.id('end-call-button'))).toBeVisible();
    });

    it('should toggle microphone mute', async () => {
      await expect(element(by.id('mute-button')).toHaveText('Mute'));
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-button')).toHaveText('Unmute'));
      await expect(element(by.id('mute-indicator'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-button')).toHaveText('Mute'));
      await expect(element(by.id('mute-indicator'))).toBeNotVisible();
    });

    it('should toggle camera on/off', async () => {
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn off camera'));
      
      await element(by.id('camera-toggle-button')).tap();
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn on camera'));
      await expect(element(by.id('camera-off-indicator'))).toBeVisible();
      
      await element(by.id('camera-toggle-button')).tap();
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn off camera'));
      await expect(element(by.id('camera-off-indicator'))).toBeNotVisible();
    });

    it('should switch between front and back camera', async () => {
      await expect(element(by.id('camera-switch-button'))).toBeVisible();
      
      await element(by.id('camera-switch-button')).tap();
      await expect(element(by.text('Switching camera...'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(1000);
      await expect(element(by.text('Switching camera...'))).toBeNotVisible();
    });

    it('should end video call', async () => {
      await element(by.id('end-call-button')).tap();
      await expect(element(by.text('End call?'))).toBeVisible();
      
      await element(by.id('confirm-end-call')).tap();
      await expect(element(by.id('video-call-screen'))).toBeNotVisible();
      await expect(element(by.text('Call ended'))).toBeVisible();
    });

    it('should show call duration', async () => {
      await expect(element(by.id('call-duration'))).toBeVisible();
      await expect(element(by.id('call-duration')).toHaveText('00:00'));
      
      // Wait for duration to update
      await testUtils.waitForNetworkIdle(3000);
      await expect(element(by.id('call-duration')).toHaveText('00:03'));
    });

    it('should handle call quality indicators', async () => {
      await expect(element(by.id('call-quality'))).toBeVisible();
      await expect(element(by.id('call-quality')).toHaveText('Good'));
      
      // Simulate poor connection
      await testUtils.simulateNetworkCondition('slow');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('call-quality')).toHaveText('Poor'));
      await expect(element(by.text('Poor connection detected'))).toBeVisible();
    });
  });

  describe('Call Features', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should show participant information', async () => {
      await expect(element(by.id('caller-name'))).toBeVisible();
      await expect(element(by.id('caller-pet'))).toBeVisible();
      await expect(element(by.id('caller-location'))).toBeVisible();
    });

    it('should display call statistics', async () => {
      await element(by.id('call-stats-button')).tap();
      await expect(element(by.id('call-stats-modal'))).toBeVisible();
      
      await expect(element(by.id('call-duration-stat'))).toBeVisible();
      await expect(element(by.id('data-usage-stat'))).toBeVisible();
      await expect(element(by.id('quality-stat'))).toBeVisible();
    });

    it('should allow screen sharing', async () => {
      await element(by.id('screen-share-button')).tap();
      await expect(element(by.text('Screen sharing permission required'))).toBeVisible();
      
      await element(by.id('allow-screen-share')).tap();
      await expect(element(by.id('screen-share-indicator'))).toBeVisible();
      await expect(element(by.text('Screen sharing active'))).toBeVisible();
    });

    it('should handle call recording', async () => {
      await element(by.id('record-button')).tap();
      await expect(element(by.text('Recording permission required'))).toBeVisible();
      
      await element(by.id('allow-recording')).tap();
      await expect(element(by.id('recording-indicator'))).toBeVisible();
      await expect(element(by.text('Recording...'))).toBeVisible();
    });
  });

  describe('Call Quality', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should adjust video quality based on connection', async () => {
      await expect(element(by.id('video-quality')).toHaveText('HD'));
      
      // Simulate poor connection
      await testUtils.simulateNetworkCondition('slow');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('video-quality')).toHaveText('SD'));
      await expect(element(by.text('Video quality reduced due to poor connection'))).toBeVisible();
    });

    it('should handle network interruptions', async () => {
      // Simulate network interruption
      await testUtils.simulateNetworkCondition('offline');
      await testUtils.waitForNetworkIdle(1000);
      
      await expect(element(by.text('Connection lost'))).toBeVisible();
      await expect(element(by.text('Attempting to reconnect...'))).toBeVisible();
      
      // Simulate reconnection
      await testUtils.simulateNetworkCondition('online');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.text('Connection restored'))).toBeVisible();
    });

    it('should show bandwidth usage', async () => {
      await element(by.id('bandwidth-button')).tap();
      await expect(element(by.id('bandwidth-modal'))).toBeVisible();
      
      await expect(element(by.id('upload-speed'))).toBeVisible();
      await expect(element(by.id('download-speed'))).toBeVisible();
      await expect(element(by.id('data-usage'))).toBeVisible();
    });
  });

  describe('Call History', () => {
    it('should display call history', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await expect(element(by.id('call-history-screen'))).toBeVisible();
      await expect(element(by.id('call-history-item'))).toBeVisible();
    });

    it('should show call details', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await element(by.id('call-history-item-0')).tap();
      await expect(element(by.id('call-details-modal'))).toBeVisible();
      
      await expect(element(by.id('call-duration-detail'))).toBeVisible();
      await expect(element(by.id('call-quality-detail'))).toBeVisible();
      await expect(element(by.id('call-date-detail'))).toBeVisible();
    });

    it('should delete call history', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await element(by.id('delete-history-button')).tap();
      await expect(element(by.text('Delete all call history?'))).toBeVisible();
      
      await element(by.id('confirm-delete')).tap();
      await expect(element(by.text('Call history deleted'))).toBeVisible();
    });
  });

  describe('Call Settings', () => {
    it('should display call settings', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await expect(element(by.id('call-settings-screen'))).toBeVisible();
      await expect(element(by.id('video-quality-setting'))).toBeVisible();
      await expect(element(by.id('audio-quality-setting'))).toBeVisible();
      await expect(element(by.id('call-recording-setting'))).toBeVisible();
    });

    it('should update video quality setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('video-quality-setting')).tap();
      await element(by.id('quality-hd')).tap();
      
      await expect(element(by.text('Video quality updated'))).toBeVisible();
    });

    it('should update audio quality setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('audio-quality-setting')).tap();
      await element(by.id('quality-high')).tap();
      
      await expect(element(by.text('Audio quality updated'))).toBeVisible();
    });

    it('should toggle call recording setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('call-recording-toggle')).tap();
      await expect(element(by.text('Call recording enabled'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle call initiation failure', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      // Simulate call initiation failure
      await testUtils.mockApiResponse('/calls/initiate', { error: 'Call failed' }, 0, 500);
      
      await element(by.id('video-call-button')).tap();
      
      await expect(element(by.text('Failed to initiate call'))).toBeVisible();
      await expect(element(by.text('Please try again later'))).toBeVisible();
    });

    it('should handle call connection failure', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Simulate connection failure
      await testUtils.mockApiResponse('/calls/connect', { error: 'Connection failed' }, 0, 500);
      
      await expect(element(by.text('Call connection failed'))).toBeVisible();
      await expect(element(by.text('Unable to connect to the other party'))).toBeVisible();
    });

    it('should handle call dropped', async () => {
      // Start a call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      // Simulate call dropped
      await testUtils.simulateNetworkCondition('offline');
      await testUtils.waitForNetworkIdle(5000);
      
      await expect(element(by.text('Call dropped'))).toBeVisible();
      await expect(element(by.text('The call was disconnected'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await expect(element(by.id('video-call-button')).toHaveLabel('Start video call'));
      await expect(element(by.id('mute-button')).toHaveLabel('Mute microphone'));
      await expect(element(by.id('camera-toggle-button')).toHaveLabel('Toggle camera'));
    });

    it('should support voice control', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should initiate call quickly', async () => {
      const startTime = Date.now();
      
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Call initiation should be fast
      expect(duration).toBeLessThan(5000);
    });

    it('should handle multiple calls efficiently', async () => {
      // Start first call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      // End first call
      await element(by.id('end-call-button')).tap();
      await element(by.id('confirm-end-call')).tap();
      
      // Start second call
      await element(by.id('video-call-button')).tap();
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });
  });
});
