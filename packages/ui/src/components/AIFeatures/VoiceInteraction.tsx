import React, { useCallback, useEffect, useRef, useState, type JSX } from 'react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognitionInstance;
  new(): SpeechRecognitionInstance;
};

export interface VoiceInteractionProps {
  /**
   * Whether the voice interaction is enabled
   */
  enabled?: boolean;

  /**
   * Callback when a voice command is recognized
   */
  onCommand?: (command: string, confidence: number) => void;

  /**
   * Callback when voice interaction is activated
   */
  onActivate?: () => void;

  /**
   * Callback when voice interaction is deactivated
   */
  onDeactivate?: () => void;

  /**
   * Custom trigger phrases
   */
  triggerPhrases?: string[];

  /**
   * Whether to show visual feedback
   */
  showVisualFeedback?: boolean;

  /**
   * Visualization style
   */
  visualizationStyle?: 'wave' | 'circle' | 'bars' | 'minimal';

  /**
   * Position of the floating button
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to use a floating button
   */
  floatingButton?: boolean;

  /**
   * Whether to mute the microphone initially
   */
  initiallyMuted?: boolean;

  /**
   * Placeholder text to show when listening
   */
  listeningPlaceholder?: string;

  /**
   * Whether to show help examples
   */
  showHelpExamples?: boolean;

  /**
   * Custom commands and responses
   */
  commandMap?: Record<string, string | (() => void)>;
}

/**
 * A component that provides voice interaction capabilities
 * Implements the latest 2025 UI/UX trend for voice interfaces
 */
export const VoiceInteraction: React.FC<VoiceInteractionProps> = ({
  enabled = true,
  onCommand,
  onActivate,
  onDeactivate,
  triggerPhrases = ['hey pawfect', 'ok pawfect'],
  showVisualFeedback = true,
  visualizationStyle = 'wave',
  position = 'bottom-right',
  className = '',
  floatingButton = true,
  initiallyMuted = true,
  listeningPlaceholder = "Listening...",
  showHelpExamples = true,
  commandMap = {}
}) => {
  // For now, default to light mode until theme hook is available
  const isDarkMode = false;
  // For now, use simple animation until animation hook is available
  const animate = useCallback((type: string) => { console.log(`Animation: ${type}`); }, []);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(initiallyMuted);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [visualData, setVisualData] = useState<number[]>([]);
  const [helpVisible, setHelpVisible] = useState<boolean>(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sample commands for help section
  const exampleCommands = [
    "Show me dogs near me",
    "Find cats that are good with children",
    "Filter for small pets",
    "Show adoption events this weekend",
    "What are the shelter hours?"
  ];

  // Set up speech recognition
  useEffect(() => {
    if (!enabled) return;

    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    // Set up event handlers
    recognitionRef.current.onstart = (): void => {
      setIsListening(true);
      if (onActivate !== null && onActivate !== undefined) onActivate();
    };

    recognitionRef.current.onend = (): void => {
      setIsListening(false);
      if (onDeactivate !== null && onDeactivate !== undefined) onDeactivate();
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent): void => {
      const current = event.resultIndex;
      const result = event.results[current];
      if (!result?.[0]) return;

      const transcript = result[0].transcript.toLowerCase();
      const { confidence } = result[0];

      setTranscript(transcript);

      // Check if a trigger phrase was spoken
      if (!isProcessing && isMuted) {
        const triggered = triggerPhrases.some(phrase => transcript.includes(phrase.toLowerCase()));
        if (triggered !== null && triggered !== undefined) {
          setIsMuted(false);
          animate('bounce');
          setIsProcessing(true);
          setTimeout(() => { setIsProcessing(false); }, 1000);
        }
      }

      // Process commands when unmuted
      if (!isMuted && !isProcessing) {
        // Custom command handling
        const matchedCommand = Object.keys(commandMap).find(cmd =>
          transcript.includes(cmd.toLowerCase())
        );

        if (matchedCommand !== null && matchedCommand !== undefined) {
          const response = commandMap[matchedCommand];
          if (typeof response === 'function') {
            response();
          }

          setIsProcessing(true);
          setTimeout(() => { setIsProcessing(false); }, 1000);
        }

        // Pass command to parent component
        if (onCommand !== null && onCommand !== undefined) {
          onCommand(transcript, confidence);
        }
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent): void => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    // Start recognition if enabled
    if (enabled && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors on cleanup
        }
      }
    };
  }, [enabled, isMuted, onActivate, onDeactivate, onCommand, animate, triggerPhrases, commandMap, isProcessing]);

  // Set up audio visualization
  useEffect(() => {
    if (!showVisualFeedback || !isListening) return;

    const setupAudioVisualization = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize audio context
        const AudioContext = window.AudioContext ?? window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();

        // Configure analyser
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.7;

        // Connect microphone source
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);

        // Start visualization loop
        visualizationLoop();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    const visualizationLoop = (): void => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Simplify data for visualization (take every 8th value)
      const simplifiedData = Array.from(dataArray).filter((_, i) => i % 8 === 0);
      setVisualData(simplifiedData);

      animationFrameRef.current = requestAnimationFrame(visualizationLoop);
    };

    setupAudioVisualization();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [showVisualFeedback, isListening]);

  // Toggle voice listening
  const toggleListening = (): void => {
    if (isListening !== null && isListening !== undefined) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      setIsMuted(true);
    } else {
      try {
        setIsMuted(false);
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        animate('bounce');
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  // Position classes for floating button
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  // Generate wave points for visualization
  const generateWavePoints = (): string => {
    if (!visualData.length) {
      return '';
    }

    const height = 40;
    const width = 100;
    const points: string[] = [];

    visualData.forEach((value, index) => {
      const x = (index / (visualData.length - 1)) * width;
      const normalizedValue = value / 255; // Normalize between 0 and 1
      const y = height / 2 + normalizedValue * height / 3 * Math.sin(index * 0.5);
      points.push(`${x},${y}`);
    });

    return `M0,${height / 2} ${points.map(p => `L${p}`).join(' ')}`;
  };

  // Different visualization renderers
  const renderVisualization = (): JSX.Element | null => {
    if (!showVisualFeedback || !isListening || visualData.length === 0) {
      return null;
    }

    switch (visualizationStyle) {
      case 'wave': {
        return (
          <svg width="100" height="40" className="mt-3">
            <path
              d={generateWavePoints()}
              fill="none"
              stroke={isDarkMode ? '#60a5fa' : '#2563eb'}
              strokeWidth="2"
            />
          </svg>
        );
      }

      case 'circle': {
        const radius = Math.max(...visualData) / 10;
        return (
          <div className="mt-3 relative h-10 w-10">
            <div
              className="absolute inset-0 rounded-full bg-blue-500 transition-all duration-200 opacity-30"
              style={{ transform: `scale(${0.5 + radius * 0.01})` }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
          </div>
        );
      }

      case 'bars': {
        return (
          <div className="mt-3 flex items-end h-10 gap-0.5">
            {visualData.slice(0, 12).map((value, index) => (
              <div
                key={index}
                className={`w-1.5 rounded-t ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
                style={{ height: `${(value / 255) * 100}%` }}
              />
            ))}
          </div>
        );
      }

      case 'minimal': {
        const avgIntensity = visualData.reduce((a, b) => a + b, 0) / visualData.length;
        return (
          <div className="mt-3 h-2">
            <div
              className={`h-2 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} transition-all duration-100`}
              style={{ width: `${(avgIntensity / 255) * 100}%` }}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Main floating button
  const renderFloatingButton = (): JSX.Element => (
    <button
      onClick={toggleListening}
      className={`
        fixed ${positionClasses[position]} z-50
        p-3 rounded-full shadow-lg transition-all duration-300
        ${isListening
          ? isDarkMode ? 'bg-blue-600 shadow-blue-500/30' : 'bg-blue-500 shadow-blue-500/50'
          : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
        }
        ${isListening ? 'scale-110' : 'scale-100'}
        ${className}
      `}
      aria-label={isListening ? "Stop listening" : "Start voice commands"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${isListening
          ? 'text-white animate-pulse'
          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isListening ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        )}
      </svg>

      {/* Ripple effect when listening */}
      {isListening !== undefined && (
        <>
          <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-blue-500" />
          <span className="absolute inset-0 rounded-full animate-pulse opacity-75 bg-blue-500 animation-delay-300" />
        </>
      )}
    </button>
  );

  // Voice command help panel
  const renderHelpPanel = (): JSX.Element => (
    <div
      className={`
        fixed bottom-20 right-6 z-40
        p-4 rounded-lg shadow-lg transition-all duration-300
        ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}
        ${helpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        max-w-xs
      `}
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        onClick={() => { setHelpVisible(false); }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <h3 className="font-medium text-lg mb-2">Voice Commands</h3>
      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Try saying "{triggerPhrases[0]}" followed by:
      </p>
      <ul className="space-y-1 text-sm">
        {exampleCommands.map((cmd, index) => (
          <li key={index} className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            "{cmd}"
          </li>
        ))}
      </ul>
    </div>
  );

  // In-line interface for non-floating button mode
  const renderInlineInterface = (): JSX.Element => (
    <div className={`
      relative w-full rounded-lg overflow-hidden transition-all duration-300
      ${isDarkMode
        ? isListening ? 'bg-gray-800' : 'bg-gray-900'
        : isListening ? 'bg-blue-50' : 'bg-white'
      }
      border ${isListening
        ? isDarkMode ? 'border-blue-700' : 'border-blue-300'
        : isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }
      ${className}
    `}>
      <div className="flex items-center p-3">
        <button
          onClick={toggleListening}
          className={`
            p-2 rounded-full transition-all duration-200
            ${isListening
              ? isDarkMode ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white'
              : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
            }
            ${isListening ? 'animate-pulse' : ''}
          `}
          aria-label={isListening ? "Stop listening" : "Start voice commands"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="ml-3 flex-1">
          <p className={`
            text-sm
            ${isListening
              ? isDarkMode ? 'text-blue-200' : 'text-blue-700'
              : isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }
          `}>
            {isListening ? listeningPlaceholder : "Click to start voice commands"}
          </p>
          {isListening !== undefined && transcript ? <p className={`
              mt-1 text-base font-medium
              ${isDarkMode ? 'text-white' : 'text-gray-900'}
            `}>
            {transcript}
          </p> : null}
        </div>

        {showHelpExamples !== undefined && (
          <button
            onClick={() => { setHelpVisible(!helpVisible); }}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="Voice command help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isListening !== undefined && showVisualFeedback ? <div className="px-3 pb-3 flex justify-center">
        {renderVisualization()}
      </div> : null}
    </div>
  );

  return (
    <>
      {floatingButton ? renderFloatingButton() : renderInlineInterface()}
      {showHelpExamples !== undefined && renderHelpPanel()}
    </>
  );
};

export default VoiceInteraction;
