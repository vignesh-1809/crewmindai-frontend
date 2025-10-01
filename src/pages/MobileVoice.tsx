import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Phone, PhoneOff, Wifi, Bluetooth, Volume2, VolumeX, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function MobileVoice() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionType, setConnectionType] = useState<'wifi' | 'bluetooth' | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentMachine, setCurrentMachine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableMachines, setAvailableMachines] = useState<string[]>([]);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Load available machines from API
      const loadMachines = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${API_BASE_URL}/api/machines`);
        if (response.ok) {
          const machines = await response.json();
          setAvailableMachines(machines.map((m: any) => m.name));
        }
      } catch (error) {
        console.error('Failed to load machines:', error);
        // Fallback to empty array if API fails
        setAvailableMachines([]);
      }
    };

    loadMachines();

    // Check for secure context (HTTPS or localhost)
    const checkSecureContext = () => {
      const isSecure = window.isSecureContext || 
                      window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      setIsSecureContext(isSecure);
    };

    checkSecureContext();
    
    // Check and request microphone permissions
    checkMicrophonePermission();

    // Check for network connection
    if (navigator.onLine) {
      setConnectionType('wifi');
      setIsConnected(true);
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(permission.state as any);
        
        // Listen for permission changes
        permission.onchange = () => {
          setMicrophonePermission(permission.state as any);
        };
      } else {
        // Fallback: Try to determine permission by attempting access
        try {
          const mediaDevices = (navigator as any).mediaDevices;
          if (mediaDevices && mediaDevices.getUserMedia) {
            const stream = await mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track: any) => track.stop());
            setMicrophonePermission('granted');
          } else {
            setMicrophonePermission('denied');
          }
        } catch (error) {
          setMicrophonePermission('denied');
        }
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicrophonePermission('unknown');
    }
  };

  const requestMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      // Success! Stop the stream and update permission
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
      
      // Show success message
      alert('✅ Microphone access granted! You can now use voice features.');
      
    } catch (error: any) {
      console.error('Error requesting microphone permission:', error);
      setMicrophonePermission('denied');
      
      // Show detailed error message
      if (error.name === 'NotAllowedError') {
        alert('❌ Microphone access was denied. Please try the manual steps below or refresh the page and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No microphone found on this device.');
      } else if (error.name === 'NotSupportedError') {
        alert('❌ Microphone access is not supported on this browser/device.');
      } else {
        alert('❌ Could not access microphone. Error: ' + error.message);
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      // Check if we're in a secure context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access requires HTTPS or localhost. Please use a secure connection.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioInput(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds max
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      // Convert speech to text
      const transcript = await speechToText(audioBlob);
      
      if (transcript.trim()) {
        const userMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          type: 'user',
          text: transcript,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);

        // Send to AI and get response
        const aiResponse = await getAIResponse(transcript);
        
        const assistantMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          type: 'assistant',
          text: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        // Speak the AI response
        await speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speechToText = async (audioBlob: Blob): Promise<string> => {
    // Use Web Speech API for speech recognition
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        // Fallback: send audio to server for transcription
        transcribeAudioOnServer(audioBlob).then(resolve).catch(reject);
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = () => {
        // Fallback to server transcription
        transcribeAudioOnServer(audioBlob).then(resolve).catch(reject);
      };

      recognition.start();
    });
  };

  const transcribeAudioOnServer = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
    const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Speech recognition failed');
    }

    const data = await response.json();
    return data.transcript || '';
  };

  const getAIResponse = async (query: string): Promise<string> => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        topK: 4,
        machine: currentMachine || undefined
      })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.answer || 'Sorry, I could not process your request.';
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      const userMessage: VoiceMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        text: textInput,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send to AI and get response
      const aiResponse = await getAIResponse(textInput);
      
      const assistantMessage: VoiceMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the AI response if possible
      if (synthRef.current) {
        await speakText(aiResponse);
      }
      
      setTextInput('');
    } catch (error) {
      console.error('Error sending text message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const connectBluetooth = async () => {
    try {
      // Request Bluetooth device (for audio devices)
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['audio_source'] }],
        optionalServices: ['audio_sink']
      });
      
      setConnectionType('bluetooth');
      setIsConnected(true);
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      alert('Bluetooth connection failed. Using WiFi connection instead.');
      setConnectionType('wifi');
      setIsConnected(true);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionType(null);
    stopRecording();
    stopSpeaking();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <Card className="p-6 mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice Assistant</h1>
          <p className="text-gray-600 text-sm mb-4">Talk to your industrial assistant</p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {isConnected ? (
              <>
                {connectionType === 'wifi' ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <Bluetooth className="h-5 w-5 text-blue-600" />
                )}
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Connected via {connectionType?.toUpperCase()}
                </Badge>
              </>
            ) : (
              <Badge variant="outline" className="text-gray-500">Disconnected</Badge>
            )}
          </div>

          {/* Microphone Permission Status */}
          {microphonePermission !== 'granted' && (
            <div className={`mb-4 p-4 rounded-lg border ${
              microphonePermission === 'denied' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-medium mb-3 ${
                  microphonePermission === 'denied' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {microphonePermission === 'denied' 
                    ? '🚫 Microphone Access Blocked' 
                    : '🎤 Microphone Permission Needed'
                  }
                </div>
                
                {microphonePermission === 'denied' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-red-700">
                      Microphone access was blocked. Try these steps:
                    </p>
                    <div className="text-xs text-red-700 text-left space-y-2">
                      <div className="font-medium">Option 1: Refresh & Try Again</div>
                      <div>1. Pull down to refresh this page</div>
                      <div>2. Tap "Allow Microphone" when prompted</div>
                      <div className="font-medium mt-2">Option 2: Manual Permission</div>
                      <div>1. Tap the address bar at the top</div>
                      <div>2. Look for a microphone icon or settings</div>
                      <div>3. Tap to allow microphone access</div>
                      <div className="font-medium mt-2">Option 3: Browser Settings</div>
                      <div>Menu → Settings → Site Settings → Microphone → Allow</div>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      🔄 Refresh & Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-blue-700">
                      Voice features need microphone access to work.
                    </p>
                    <Button
                      onClick={requestMicrophonePermission}
                      disabled={isRequestingPermission}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isRequestingPermission ? '⏳ Requesting...' : '🎤 Allow Microphone'}
                    </Button>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>When prompted, tap "Allow" to enable voice features</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {microphonePermission === 'granted' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-green-800">✅ Microphone Ready!</div>
                <div className="text-xs text-green-700">Voice features are now enabled</div>
              </div>
            </div>
          )}

          {/* Current Machine */}
          {currentMachine && (
            <Badge variant="default" className="mb-4">
              Machine: {currentMachine}
            </Badge>
          )}

          {/* Connection Buttons */}
          {!isConnected && (
            <div className="flex gap-2">
              <Button 
                onClick={() => { setConnectionType('wifi'); setIsConnected(true); }}
                variant="default"
                className="flex-1"
              >
                <Wifi className="h-4 w-4 mr-2" />
                WiFi
              </Button>
              <Button 
                onClick={connectBluetooth}
                variant="outline"
                className="flex-1"
              >
                <Bluetooth className="h-4 w-4 mr-2" />
                Bluetooth
              </Button>
            </div>
          )}

          {isConnected && (
            <Button 
              onClick={disconnect}
              variant="destructive"
              size="sm"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          )}
        </Card>

        {/* Voice Controls */}
        {isConnected && (
          <Card className="p-6 mb-4">
            {/* Main Voice Button */}
            <div className="text-center mb-4">
              <Button
                 onMouseDown={microphonePermission === 'granted' ? startRecording : undefined}
                 onMouseUp={microphonePermission === 'granted' ? stopRecording : undefined}
                 onTouchStart={microphonePermission === 'granted' ? startRecording : undefined}
                 onTouchEnd={microphonePermission === 'granted' ? stopRecording : undefined}
                 disabled={isLoading || microphonePermission !== 'granted'}
                 size="lg"
                 className={`w-32 h-32 rounded-full ${
                   microphonePermission !== 'granted'
                     ? 'bg-gray-400 cursor-not-allowed'
                     : isRecording 
                       ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                       : 'bg-blue-500 hover:bg-blue-600'
                 }`}
               >
                 {microphonePermission !== 'granted' ? (
                   <MicOff className="h-12 w-12" />
                 ) : isRecording ? (
                   <MicOff className="h-12 w-12" />
                 ) : (
                   <Mic className="h-12 w-12" />
                 )}
               </Button>
               <p className="text-sm text-gray-600 mt-2">
                 {microphonePermission !== 'granted'
                   ? 'Allow microphone access first' 
                   : isRecording 
                     ? 'Release to send' 
                     : 'Hold to talk'
                 }
               </p>
            </div>

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Volume2 className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-600">Assistant is speaking...</span>
                <Button
                  onClick={stopSpeaking}
                  size="sm"
                  variant="outline"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="text-center text-sm text-gray-600">
                Processing your message...
              </div>
            )}

            {/* Text Fallback */}
            {microphonePermission !== 'granted' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600 mb-3">
                  Can't use voice? Type your question instead:
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 min-h-[40px] max-h-[100px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendTextMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={isLoading || !textInput.trim()}
                    size="sm"
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Machine Selection */}
        {isConnected && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-sm mb-2">Machine Selection</h3>
            {availableMachines.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {availableMachines.map((machine) => (
                    <Button
                      key={machine}
                      onClick={() => setCurrentMachine(machine)}
                      variant={currentMachine === machine ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {machine}
                    </Button>
                  ))}
                </div>
                {currentMachine && (
                  <Button
                    onClick={() => setCurrentMachine(null)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                  >
                    Clear Selection
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No machines available. Add machines in the workspace first.
              </div>
            )}
          </Card>
        )}

        {/* Message History */}
        {messages.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Conversation</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.slice(-5).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-100 ml-4'
                      : 'bg-gray-100 mr-4'
                  }`}
                >
                  <div className="font-medium text-xs mb-1">
                    {message.type === 'user' ? 'You' : 'Assistant'} • {formatTime(message.timestamp)}
                  </div>
                  <div>{message.text}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        {isConnected && messages.length === 0 && (
          <Card className="p-4 mt-4">
            <h3 className="font-semibold text-sm mb-2">How to Use</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Hold the blue microphone button to record</li>
              <li>• Release to send your message</li>
              <li>• Select a machine for context-aware help</li>
              <li>• The assistant will speak responses back to you</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
