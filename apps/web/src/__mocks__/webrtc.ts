/**
 * WebRTC Mock for testing
 */

// Mock MediaStream class
export class MockMediaStream {
  private videoTracks: MockMediaStreamTrack[] = [];
  private audioTracks: MockMediaStreamTrack[] = [];

  constructor(tracks?: MockMediaStreamTrack[]) {
    if (tracks) {
      tracks.forEach((track) => {
        if (track.kind === 'video') {
          this.videoTracks.push(track);
        } else if (track.kind === 'audio') {
          this.audioTracks.push(track);
        }
      });
    }
  }

  getVideoTracks() {
    return this.videoTracks;
  }

  getAudioTracks() {
    return this.audioTracks;
  }

  getTracks() {
    return [...this.videoTracks, ...this.audioTracks];
  }

  addTrack(track: MockMediaStreamTrack) {
    if (track.kind === 'video') {
      this.videoTracks.push(track);
    } else if (track.kind === 'audio') {
      this.audioTracks.push(track);
    }
  }

  removeTrack(track: MockMediaStreamTrack) {
    if (track.kind === 'video') {
      this.videoTracks = this.videoTracks.filter((t) => t !== track);
    } else if (track.kind === 'audio') {
      this.audioTracks = this.audioTracks.filter((t) => t !== track);
    }
  }
}

// Mock MediaStreamTrack class
export class MockMediaStreamTrack {
  kind: 'audio' | 'video';
  id: string;
  enabled: boolean;
  muted: boolean;
  readyState: 'live' | 'ended';
  onended: () => void;
  onmute: () => void;
  onunmute: () => void;

  constructor(kind: 'audio' | 'video') {
    this.kind = kind;
    this.id = Math.random().toString(36).substring(2, 15);
    this.enabled = true;
    this.muted = false;
    this.readyState = 'live';
    this.onended = (): void => {};
    this.onmute = (): void => {};
    this.onunmute = (): void => {};
  }

  stop() {
    this.readyState = 'ended';
    if (this.onended) {
      this.onended();
    }
  }

  clone() {
    const clone = new MockMediaStreamTrack(this.kind);
    clone.enabled = this.enabled;
    clone.muted = this.muted;
    clone.readyState = this.readyState;
    return clone;
  }
}

// Mock RTCPeerConnection class
export class MockRTCPeerConnection {
  localDescription: unknown = null;
  remoteDescription: unknown = null;
  signalingState: string = 'stable';
  iceConnectionState: string = 'new';
  iceGatheringState: string = 'new';
  connectionState: string = 'new';
  onicecandidate: ((event: Event) => void) | null = null;
  ontrack: ((event: Event) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  onsignalingstatechange: (() => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  onicegatheringstatechange: (() => void) | null = null;
  onicecandidateerror: ((event: Event) => void) | null = null;
  onnegotiationneeded: (() => void) | null = null;
  ondatachannel: ((event: Event) => void) | null = null;

  constructor(_configuration?: RTCConfiguration) {
    // Configuration is ignored in the mock
  }

  async createOffer(_options?: RTCOfferOptions) {
    return {
      type: 'offer',
      sdp: 'mock-sdp-offer',
    };
  }

  async createAnswer(_options?: RTCAnswerOptions) {
    return {
      type: 'answer',
      sdp: 'mock-sdp-answer',
    };
  }

  async setLocalDescription(description: RTCSessionDescriptionInit) {
    this.localDescription = description;
    this.signalingState = description.type === 'offer' ? 'have-local-offer' : 'stable';
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit) {
    this.remoteDescription = description;
    this.signalingState = description.type === 'offer' ? 'have-remote-offer' : 'stable';
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
  }

  addIceCandidate(_candidate: RTCIceCandidateInit) {
    // Simulate adding ICE candidate
    return Promise.resolve();
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream) {
    // Simulate adding a track
    return {
      track,
      streams: [stream],
      sender: {
        track,
        replaceTrack: (_newTrack: MediaStreamTrack | null) => Promise.resolve(),
      },
    };
  }

  getStats() {
    return Promise.resolve({});
  }

  close() {
    this.signalingState = 'closed';
    this.iceConnectionState = 'closed';
    this.connectionState = 'closed';

    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
    if (this.oniceconnectionstatechange) {
      this.oniceconnectionstatechange();
    }
    if (this.onconnectionstatechange) {
      this.onconnectionstatechange();
    }
  }

  createDataChannel(label: string, _options?: RTCDataChannelInit) {
    return {
      label,
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      readyState: 'connecting',
    };
  }
}

// Mock RTCSessionDescription class
export class MockRTCSessionDescription {
  type: string;
  sdp: string;

  constructor(init: unknown) {
    this.type = init.type;
    this.sdp = init.sdp;
  }
}

// Mock RTCIceCandidate class
export class MockRTCIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;

  constructor(init: unknown) {
    this.candidate = init.candidate;
    this.sdpMid = init.sdpMid;
    this.sdpMLineIndex = init.sdpMLineIndex;
  }
}

// Set up navigator.mediaDevices mocks
export const _mockMediaDevices = {
  getUserMedia: jest.fn().mockImplementation((constraints) => {
    const videoTrack = constraints?.video ? new MockMediaStreamTrack('video') : undefined;
    const audioTrack = constraints?.audio ? new MockMediaStreamTrack('audio') : undefined;
    const tracks = [];

    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);

    return Promise.resolve(new MockMediaStream(tracks));
  }),

  getDisplayMedia: jest.fn().mockImplementation((constraints) => {
    const videoTrack = constraints?.video ? new MockMediaStreamTrack('video') : undefined;
    const audioTrack = constraints?.audio ? new MockMediaStreamTrack('audio') : undefined;
    const tracks = [];

    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);

    return Promise.resolve(new MockMediaStream(tracks));
  }),

  enumerateDevices: jest.fn().mockResolvedValue([
    {
      deviceId: 'camera-1',
      kind: 'videoinput',
      label: 'Mock Camera',
      groupId: 'group-1',
    },
    {
      deviceId: 'microphone-1',
      kind: 'audioinput',
      label: 'Mock Microphone',
      groupId: 'group-2',
    },
    {
      deviceId: 'speaker-1',
      kind: 'audiooutput',
      label: 'Mock Speaker',
      groupId: 'group-2',
    },
  ]),
};
