/**
 * Video Calling E2E Tests
 * Comprehensive testing of video calling features including screen sharing and recording
 */

describe('Video Calling Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Call Initiation', () => {
    it('should start video call from chat', async () => {
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await element(by.id('video-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
    });

    it('should start voice call from chat', async () => {
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      
      await element(by.id('voice-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('caller-avatar'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
    });

    it('should show incoming call notification', async () => {
      // Simulate incoming call
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('incoming-call-modal'))).toBeVisible();
      await expect(element(by.id('caller-name'))).toBeVisible();
      await expect(element(by.id('caller-avatar'))).toBeVisible();
      await expect(element(by.id('answer-button'))).toBeVisible();
      await expect(element(by.id('decline-button'))).toBeVisible();
    });

    it('should answer incoming call', async () => {
      await element(by.id('answer-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
    });

    it('should decline incoming call', async () => {
      await element(by.id('decline-button')).tap();
      
      await expect(element(by.id('incoming-call-modal'))).not.toBeVisible();
      await expect(element(by.text('Call declined'))).toBeVisible();
    });
  });

  describe('Call Controls', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should mute/unmute microphone', async () => {
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-indicator'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-indicator'))).not.toBeVisible();
    });

    it('should enable/disable video', async () => {
      await element(by.id('video-toggle-button')).tap();
      await expect(element(by.id('video-off-indicator'))).toBeVisible();
      
      await element(by.id('video-toggle-button')).tap();
      await expect(element(by.id('video-off-indicator'))).not.toBeVisible();
    });

    it('should switch camera', async () => {
      await element(by.id('switch-camera-button')).tap();
      await expect(element(by.text('Camera switched'))).toBeVisible();
    });

    it('should toggle speaker', async () => {
      await element(by.id('speaker-button')).tap();
      await expect(element(by.id('speaker-indicator'))).toBeVisible();
      
      await element(by.id('speaker-button')).tap();
      await expect(element(by.id('speaker-indicator'))).not.toBeVisible();
    });

    it('should end call', async () => {
      await element(by.id('end-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).not.toBeVisible();
      await expect(element(by.text('Call ended'))).toBeVisible();
    });
  });

  describe('Screen Sharing', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should start screen sharing', async () => {
      await element(by.id('screen-share-button')).tap();
      
      // Permission dialog
      await expect(element(by.id('screen-share-permission'))).toBeVisible();
      await element(by.id('allow-screen-share')).tap();
      
      await expect(element(by.id('screen-share-indicator'))).toBeVisible();
      await expect(element(by.text('Screen sharing active'))).toBeVisible();
    });

    it('should stop screen sharing', async () => {
      // Start screen sharing first
      await element(by.id('screen-share-button')).tap();
      await element(by.id('allow-screen-share')).tap();
      
      // Stop screen sharing
      await element(by.id('stop-screen-share-button')).tap();
      
      await expect(element(by.id('screen-share-indicator'))).not.toBeVisible();
      await expect(element(by.text('Screen sharing stopped'))).toBeVisible();
    });

    it('should show screen share quality indicator', async () => {
      await element(by.id('screen-share-button')).tap();
      await element(by.id('allow-screen-share')).tap();
      
      await expect(element(by.id('screen-share-quality'))).toBeVisible();
      await expect(element(by.id('quality-indicator'))).toBeVisible();
    });
  });

  describe('Call Recording', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should start call recording', async () => {
      await element(by.id('record-button')).tap();
      
      // Permission dialog
      await expect(element(by.id('recording-permission'))).toBeVisible();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.id('recording-indicator'))).toBeVisible();
      await expect(element(by.text('Recording in progress'))).toBeVisible();
    });

    it('should stop call recording', async () => {
      // Start recording first
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      // Stop recording
      await element(by.id('stop-recording-button')).tap();
      
      await expect(element(by.id('recording-indicator'))).not.toBeVisible();
      await expect(element(by.text('Recording saved'))).toBeVisible();
    });

    it('should show recording duration', async () => {
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.id('recording-duration'))).toBeVisible();
      
      // Wait for duration to update
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('recording-duration'))).toHaveText('00:02');
    });

    it('should notify other participant about recording', async () => {
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.text('Recording notification sent'))).toBeVisible();
    });
  });

  describe('Call Quality Indicators', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should display connection quality indicator', async () => {
      await expect(element(by.id('connection-quality'))).toBeVisible();
      await expect(element(by.id('quality-bars'))).toBeVisible();
    });

    it('should show network speed indicator', async () => {
      await expect(element(by.id('network-speed'))).toBeVisible();
      await expect(element(by.id('speed-indicator'))).toBeVisible();
    });

    it('should display call statistics', async () => {
      await element(by.id('call-stats-button')).tap();
      
      await expect(element(by.id('call-stats-modal'))).toBeVisible();
      await expect(element(by.id('bitrate-display'))).toBeVisible();
      await expect(element(by.id('packet-loss-display'))).toBeVisible();
      await expect(element(by.id('latency-display'))).toBeVisible();
    });

    it('should warn about poor connection', async () => {
      // Simulate poor connection
      await testUtils.waitForNetworkIdle(3000);
      
      await expect(element(by.text('Poor connection detected'))).toBeVisible();
      await expect(element(by.id('connection-warning'))).toBeVisible();
    });
  });

  describe('Call Background Handling', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should maintain call in background', async () => {
      await device.sendToHome();
      
      // Call should continue in background
      await testUtils.waitForNetworkIdle(2000);
      
      await device.launchApp();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should show call notification in background', async () => {
      await device.sendToHome();
      
      // Should show call notification
      await expect(element(by.text('Ongoing call'))).toBeVisible();
    });

    it('should handle call interruption', async () => {
      // Simulate incoming call interruption
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('call-interruption-modal'))).toBeVisible();
      await expect(element(by.id('hold-current-call'))).toBeVisible();
      await expect(element(by.id('end-current-call'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should support screen readers', async () => {
      await expect(element(by.id('mute-button'))).toHaveLabel('Mute microphone');
      await expect(element(by.id('video-toggle-button'))).toHaveLabel('Toggle video');
      await expect(element(by.id('end-call-button'))).toHaveLabel('End call');
    });

    it('should announce call state changes', async () => {
      await element(by.id('mute-button')).tap();
      await expect(element(by.text('Microphone muted'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.text('Microphone unmuted'))).toBeVisible();
    });

    it('should support voice commands', async () => {
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
      
      // Simulate voice command
      await element(by.id('voice-mute-command')).tap();
      await expect(element(by.id('mute-indicator'))).toBeVisible();
    });
  });
});
