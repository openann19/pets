export interface VideoCallConfig {
  roomId: string;
  userId: string;
  video?: boolean;
  audio?: boolean;
}

class VideoCallService {
  async initializeCall(config: VideoCallConfig): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: config.video !== false,
      audio: config.audio !== false,
    });
    return stream;
  }

  endCall() {
    // Stub implementation
  }

  toggleVideo(enabled: boolean) {
    // Stub implementation
  }

  toggleAudio(enabled: boolean) {
    // Stub implementation
  }

  startScreenShare() {
    // Stub implementation
  }

  stopScreenShare() {
    // Stub implementation
  }
}

export const videoCallService = new VideoCallService();
