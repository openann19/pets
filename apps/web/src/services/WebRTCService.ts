/**
 * WebRTC Service
 * Handles WebRTC connections, signaling, and media streams
 */

interface EventData {
    [key: string]: unknown;
}

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private screenShareStream: MediaStream | null = null;
    private socket: { emit: (event: string, data?: EventData) => void; on: (event: string, handler: (data: EventData) => void) => void } | null = null;
    private roomId: string;
    private userId: string;

    // Event handlers
    public onLocalStream: (stream: MediaStream) => void = () => { };
    public onRemoteStream: (stream: MediaStream) => void = () => { };
    public onConnectionStateChange: (state: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed') => void = () => { };
    public onError: (error: Error) => void = () => { };

    constructor(roomId: string, userId: string) {
        this.roomId = roomId;
        this.userId = userId;

        // Initialize socket connection for signaling
        this.initializeSignaling();
    }

    private initializeSignaling(): void {
        // Simulate socket initialization
        this.socket = {
            emit: () => { },
            on: () => { }
        };
    }

    public async connect(): Promise<void> {
        try {
            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });

            // Set up event handlers for peer connection
            this.setupPeerConnectionEvents();

            // Notify about local stream
            this.onLocalStream(this.localStream);

        } catch (error) {
            this.onError(error instanceof Error ? error : new Error('Failed to establish connection'));
        }
    }

    private setupPeerConnectionEvents(): void {
        if (!this.peerConnection) return;

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.socket) {
                this.socket.emit('ice-candidate', {
                    roomId: this.roomId,
                    userId: this.userId,
                    candidate: event.candidate
                });
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection) {
                this.onConnectionStateChange(this.peerConnection.connectionState);
            }
        };

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                this.onRemoteStream(this.remoteStream);
            }
        };
    }

    public async startScreenSharing(): Promise<void> {
        try {
            // Using properly typed getDisplayMedia API
            this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

            if (this.peerConnection && this.localStream) {
                // Replace video track with screen share track
                const videoTrack = this.localStream.getVideoTracks()[0];
                const screenTrack = this.screenShareStream.getVideoTracks()[0];

                if (videoTrack && screenTrack) {
                    const senders = this.peerConnection.getSenders();
                    const sender = senders.find(s => s.track && s.track.kind === 'video');

                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                }
            }
        } catch (error) {
            this.onError(error instanceof Error ? error : new Error('Failed to start screen sharing'));
        }
    }

    public stopScreenSharing(): void {
        if (!this.peerConnection || !this.localStream || !this.screenShareStream) return;

        // Stop all tracks in screen share stream
        this.screenShareStream.getTracks().forEach(track => track.stop());

        // Replace screen track with original video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            const senders = this.peerConnection.getSenders();
            const sender = senders.find(s => s.track && s.track.kind === 'video');

            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }

        this.screenShareStream = null;
    }

    public disconnect(): void {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        if (this.screenShareStream) {
            this.screenShareStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Reset streams
        this.localStream = null;
        this.remoteStream = null;
        this.screenShareStream = null;

        // Notify about disconnection
        this.onConnectionStateChange('disconnected');
    }
}