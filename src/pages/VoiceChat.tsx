import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Mic, 
  MicOff, 
  MessageSquare, 
  ArrowLeft, 
  Volume2, 
  AlertTriangle, 
  Play,
  User,
  Square,
  RefreshCw,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  emotion?: string;
  sentiment?: number;
  transcription?: boolean;
}

// Define the SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (event: any) => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  onend: (event: any) => void;
}

// Define the window with SpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export default function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-" + Date.now(),
      content: "Hello! I'm your warehouse assistant. Ask me 'What machines are available?' to see all machines, or tell me which specific machine you need help with.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [machines, setMachines] = useState<{id: string; name: string; posX: number; posZ: number}[]>([]);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load machines from API
  useEffect(() => {
    const loadMachines = async () => {
      try {
        console.log('Loading machines from /api/machines...');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const response = await fetch(`${API_BASE_URL}/api/machines`);
        console.log('Machines API response status:', response.status);
        const data = await response.json();
        console.log('Machines API response data:', data);
        if (Array.isArray(data)) {
          setMachines(data);
          console.log('Machines loaded successfully:', data.length, 'machines');
        } else {
          console.log('Machines data is not an array:', data);
        }
      } catch (error) {
        console.error('Failed to load machines:', error);
        // Fallback to sample machines for testing
        console.log('Using fallback sample machines');
        setMachines([
          { id: '1', name: 'Printer A', posX: 10, posZ: 5 },
          { id: '2', name: 'Conveyor Belt B', posX: 20, posZ: 15 },
          { id: '3', name: 'Packaging Machine C', posX: 5, posZ: 25 },
          { id: '4', name: 'Scanner Station D', posX: 15, posZ: 10 }
        ]);
      }
    };
    loadMachines();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Reset error state
    setSpeechRecognitionError(null);
    setPermissionDenied(false);
    
    // Check if speech recognition is available first
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
      setSpeechRecognitionError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Initialize speech recognition without requiring microphone access upfront
    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Changed to false for better reliability
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setSpeechRecognitionError(null);
      };
      
      let fullTranscript = '';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimText = '';
        
        // Get all final results from the beginning
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimText += transcript;
          }
        }
        
        // Update the full transcript
        fullTranscript = finalTranscript;
        
        // Update state for display
        setTranscription(finalTranscript);
        setInterimTranscript(interimText);
        
        // Update volume based on speech confidence
        if (event.results.length > 0) {
          const confidence = event.results[event.results.length - 1][0].confidence;
          if (confidence !== undefined) {
            setVolumeLevel(Math.min(100, Math.floor(confidence * 100)));
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        setIsListening(false);
        fullTranscript = ''; // Clear transcript on error
        
        // Handle specific error types
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setPermissionDenied(true);
            setSpeechRecognitionError("Microphone access was denied. Please allow microphone access and refresh the page.");
            break;
          case 'no-speech':
            setSpeechRecognitionError("No speech was detected. Please try speaking again.");
            break;
          case 'audio-capture':
            setSpeechRecognitionError("No microphone was found. Please check your microphone connection.");
            break;
          case 'network':
            setSpeechRecognitionError("Network error occurred. Speech recognition may not be available offline.");
            break;
          case 'service-not-allowed':
            setSpeechRecognitionError("Speech recognition service is not allowed. Please check your browser settings.");
            break;
          case 'aborted':
            // Normal when user stops, don't show error
            setSpeechRecognitionError(null);
            break;
          default:
            setSpeechRecognitionError(`Speech recognition error: ${event.error}. Please try again.`);
        }
        
        // Only show toast for non-aborted errors
        if (event.error !== 'aborted') {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended, full transcript:', fullTranscript);
        setIsListening(false);
        setInterimTranscript("");
        
        // Send message if we have transcription
        if (fullTranscript.trim()) {
          console.log('Sending message:', fullTranscript.trim());
          handleSendMessage(fullTranscript.trim());
          setTranscription("");
          fullTranscript = ''; // Clear the captured transcript
        } else {
          console.log('No transcript to send');
        }
      };
      
      console.log('Speech recognition initialized successfully');
      
    } catch (initError) {
      console.error("Error initializing speech recognition:", initError);
      setIsSpeechRecognitionSupported(false);
      setSpeechRecognitionError("Failed to initialize speech recognition. Please refresh the page and try again.");
    }
    
    return () => {
      // Clean up
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSpeechSynthesisSupported(false);
      console.warn("Speech synthesis not supported in this browser");
      return;
    }
    
    // Load voices - needed for Chrome
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    
    // Chrome requires this event listener to get voices
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      // Cancel any ongoing speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // High-quality voice synthesis
  const speakConversational = (text: string) => {
    if (!window.speechSynthesis || !isSpeechSynthesisSupported || !text) return;
    
    setIsSpeaking(true);
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current = utterance;
    
    // Set voice to a female voice if available
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => v.name).join(", "));
    
    // Try to find a good voice in this order of preference
    let selectedVoice = null;
    
    // First try to find premium voices
    selectedVoice = voices.find(voice => 
      (voice.name.includes('Google UK English Female') || 
       voice.name.includes('Microsoft Zira') ||
       voice.name.includes('Samantha') ||
       voice.name.includes('Microsoft Hazel')) && 
      (voice.lang.startsWith('en'))
    );
    
    // If no premium voice, try any female English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        (voice.name.includes('female') || voice.name.includes('Female')) && 
        (voice.lang.startsWith('en'))
      );
    }
    
    // If still no voice, try any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    }
    
    // If still no voice, use the first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
    
    if (selectedVoice) {
      console.log("Selected voice:", selectedVoice.name);
      utterance.voice = selectedVoice;
    }
    
    // Extract message features to drive human-like parameters
    const isQuestion = text.includes('?');
    const isExclamation = text.includes('!');
    const wordCount = text.split(/\s+/).length;
    
    // Determine speech base rate - faster for short messages, slower for longer ones
    let baseRate = wordCount < 10 ? 0.95 : wordCount > 30 ? 0.85 : 0.9;
    
    // Determine pitch variation
    let basePitch = 1.0; // Default neutral pitch
    
    // Adjust for question/exclamation
    if (isQuestion) {
      baseRate *= 0.95; // Slightly slower for questions
      basePitch = 1.05; // Slightly higher pitch for questions
    } else if (isExclamation) {
      baseRate *= 1.1; // Slightly faster for exclamations
      basePitch = 1.1; // Higher pitch for exclamations
    }
    
    // Set the voice parameters for human-like speech
    utterance.rate = baseRate;
    utterance.pitch = basePitch;
    utterance.volume = 0.9;
    
    // Handle events
    utterance.onend = () => {
      setIsSpeaking(false);
      synthRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      synthRef.current = null;
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // TTS with fallback to backend API
  const playTTS = async (text: string) => {
    if (!text) return;
    
    // Remove emojis from the text to avoid issues with TTS
    const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    try {
      // Try backend TTS first
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const tts = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textWithoutEmojis })
      });
      
      if (tts.ok) {
        const blob = await tts.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          // Fallback to browser synthesis
          speakConversational(textWithoutEmojis);
        };
        
        await audio.play();
        return;
      }
    } catch (error) {
      console.error('Backend TTS error:', error);
    }
    
    // Fallback to high-quality local voice
    speakConversational(textWithoutEmojis);
  };

  // Handle sending voice message and getting response
  const handleSendMessage = async (text: string) => {
    console.log('handleSendMessage called with text:', text);
    if (!text.trim()) {
      console.log('Empty text, returning');
      return;
    }
    
    console.log('Setting processing to true');
    setIsProcessing(true);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: text.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      
      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);
      
      // Show typing animation
      setIsTyping(true);
      
      // Create COMPLETE message history for API (exclude only system messages and transcriptions)
      const messageHistory = messages
        .filter(msg => msg.sender !== "system" && !msg.transcription) // Exclude only system messages and transcriptions
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content
        }));
      
      // Add latest message
      messageHistory.push({ role: "user", content: text.trim() });
      
      console.log(`Sending ${messageHistory.length} messages to LLM API`);
      
      // Get COMPLETE conversation context (all messages except system ones)
      const allMessages = messages.filter(msg => msg.sender !== "system" && !msg.transcription);
      let conversationContext = '';
      if (allMessages.length > 0) {
        conversationContext = allMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
        console.log(`Including FULL conversation context: ${allMessages.length} messages`);
      } else {
        console.log('No conversation context available');
      }
      
      let enrichedQuery = text;
      
      // Build enriched query with all context
      let contextParts = [];
      
      // Add COMPLETE conversation history first (this is the most important)
      if (conversationContext) {
        contextParts.push(`FULL CONVERSATION HISTORY:\n${conversationContext}`);
      }
      
      // Add machines list ONLY if user is asking for the list
      const isAskingForMachineList = /what.*machines?.*available|list.*machines?|which.*machines?|show.*machines?|machines?.*are.*there|available.*machines?/i.test(text);
      
      console.log('Machines available for context:', machines.length);
      console.log('Is asking for machine list:', isAskingForMachineList);
      
      if (machines.length > 0 && isAskingForMachineList) {
        const machinesList = machines.map(m => `- ${m.name} `).join('\n');
        contextParts.push(`AVAILABLE MACHINES (user requested list):\n${machinesList}`);
      }
      
      // Auto-detect machine name from user input
      let detectedMachine = null;
      if (machines.length > 0 && !isAskingForMachineList) {
        const lowerText = text.toLowerCase();
        for (const machine of machines) {
          const machineName = machine.name.toLowerCase();
          // Check if machine name is mentioned in the text
          if (lowerText.includes(machineName) || 
              lowerText.includes(machineName.split(' ')[0]) || // First word of machine name
              lowerText.includes(machineName.split(' ').pop() || '')) { // Last word of machine name
            detectedMachine = machine.name;
            setSelectedMachine(machine.name);
            console.log('Auto-detected machine:', machine.name);
            break;
          }
        }
      }
      
      // Add selected machine context
      if (selectedMachine || detectedMachine) {
        const currentMachine = detectedMachine || selectedMachine;
        contextParts.push(`CURRENT FOCUS: Working with ${currentMachine}`);
        if (detectedMachine) {
          contextParts.push(`MACHINE DETECTED: User mentioned "${detectedMachine}" in their message`);
        }
      }
      
      // Combine all context with the user question
      if (contextParts.length > 0) {
        let instructions = `\n\nCURRENT USER QUESTION: ${text}\n\nIMPORTANT: Please refer to the FULL CONVERSATION HISTORY above to understand the complete context and provide an appropriate response that builds on our previous discussion.`;
        
        // Add specific instruction if user is asking for machine list
        if (isAskingForMachineList && machines.length > 0) {
          const machinesList = machines.map(m => `${m.name} `).join(', ');
          instructions += `\n\nSPECIAL INSTRUCTION: The user is asking for available machines. You MUST respond with the list of machines. Here are the available machines: ${machinesList}. Please list these machines in your response.`;
        }
        
        enrichedQuery = `${contextParts.join('\n\n')}${instructions}`;
      }
      
      console.log('Final enriched query being sent:', enrichedQuery);

      // Try streaming API first
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const resp = await fetch(`${API_BASE_URL}/api/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enrichedQuery,
          topK: 4,
          machine: selectedMachine || undefined,
        })
      });

      let finalText = '';
      const id = `bot-${Date.now()}`;
      const reply: Message = { id, content: '', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, reply]);

      if (!resp.ok || !resp.body) {
        // fallback to non-streaming
        const fallback = await fetch(`${API_BASE_URL}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: enrichedQuery, topK: 4, machine: selectedMachine || undefined })
        });
        const data = await fallback.json();
        finalText = data.answer || 'Sorry, no response available.';
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: finalText } : msg));
      } else {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split('\n');
          for (const line of lines) {
            if (!line) continue;
            try {
              const obj = JSON.parse(line);
              if (typeof obj.delta === 'string') {
                acc += obj.delta;
                const delta = obj.delta;
                setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: msg.content + delta } : msg));
              }
            } catch { /* ignore */ }
          }
        }
        finalText = acc;
      }
      
      // Hide typing animation
      setIsTyping(false);
      
      // Check if user asked for machine list but LLM didn't provide it
      if (isAskingForMachineList && machines.length > 0 && finalText) {
        const responseText = finalText.toLowerCase();
        const hasMachineNames = machines.some(machine => 
          responseText.includes(machine.name.toLowerCase()) || 
          responseText.includes(machine.name.split(' ')[0].toLowerCase())
        );
        
        if (!hasMachineNames) {
          // LLM didn't provide the machine list, so we'll add it
          const machinesList = machines.map(m => `${m.name} at position X:${m.posX}, Z:${m.posZ}`).join(', ');
          const enhancedResponse = `Here are the available machines in the warehouse: ${machinesList}. Which one do you need help with?`;
          
          console.log('LLM did not provide machine list, adding fallback response');
          
          // Update the message
          setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: enhancedResponse } : msg));
          await playTTS(enhancedResponse);
        } else {
          // Play TTS for the original response
          await playTTS(finalText);
        }
      } else {
        // Play TTS for the original response
        await playTTS(finalText);
      }
      
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      const errorReply: Message = { 
        id: `error-${Date.now()}`, 
        content: 'Sorry, something went wrong. Please try again.', 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorReply]);
      speakConversational(errorReply.content);
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  // Toggle microphone listening
  const toggleListening = () => {
    // Clear any previous error
    setSpeechRecognitionError(null);
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current || !isSpeechRecognitionSupported) {
      console.log('Speech recognition not available');
      setSpeechRecognitionError("Speech recognition is not available in your browser.");
      return;
    }
    
    try {
      // First check microphone permissions
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately, we just needed to check permission
          stream.getTracks().forEach(track => track.stop());
        } catch (micError) {
          console.error('Microphone access error:', micError);
          setPermissionDenied(true);
          setSpeechRecognitionError("Microphone access was denied. Please allow microphone access in your browser settings.");
          return;
        }
      }
      
      // Clear previous state
      setTranscription("");
      setInterimTranscript("");
      setSpeechRecognitionError(null);
      setIsListening(true);
      
      // Start speech recognition
      recognitionRef.current.start();
      console.log('Starting speech recognition...');
      
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      
      // More specific error handling
      if (error.name === 'InvalidStateError') {
        setSpeechRecognitionError("Speech recognition is already running. Please wait and try again.");
      } else if (error.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setSpeechRecognitionError("Microphone access was denied. Please allow microphone access and refresh the page.");
      } else {
        setSpeechRecognitionError("Failed to start speech recognition. Please try again.");
      }
      
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
        // Force stop by aborting
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.error("Error aborting speech recognition:", abortError);
        }
      }
    }
    setIsListening(false);
    setSpeechRecognitionError(null);
  };

  // Cancel speech when user starts speaking
  useEffect(() => {
    if (isListening && isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isListening, isSpeaking]);

  // Simulate volume meter when listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        if (!transcription && !interimTranscript) {
          // Gentler volume indication when waiting for speech
          setVolumeLevel(Math.floor(Math.random() * 30));
        }
      }, 150);
    } else {
      setVolumeLevel(0);
    }
    
    return () => clearInterval(interval);
  }, [isListening, transcription, interimTranscript]);

  const displayText = transcription + interimTranscript;

  // Reset speech recognition
  const resetSpeechRecognition = () => {
    // Stop current recognition if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Error aborting speech recognition:", e);
      }
    }
    
    // Reset all states
    setIsListening(false);
    setTranscription("");
    setInterimTranscript("");
    setSpeechRecognitionError(null);
    setPermissionDenied(false);
    
    // Reinitialize
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        // Set up event handlers again
        let resetFullTranscript = '';
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition restarted');
          setSpeechRecognitionError(null);
        };
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimText = '';
          
          // Get all final results from the beginning
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimText += transcript;
            }
          }
          
          // Update the full transcript
          resetFullTranscript = finalTranscript;
          
          // Update state for display
          setTranscription(finalTranscript);
          setInterimTranscript(interimText);
          
          if (event.results.length > 0) {
            const confidence = event.results[event.results.length - 1][0].confidence;
            if (confidence !== undefined) {
              setVolumeLevel(Math.min(100, Math.floor(confidence * 100)));
            }
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          resetFullTranscript = ''; // Clear transcript on error
          
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              setPermissionDenied(true);
              setSpeechRecognitionError("Microphone access was denied. Please allow microphone access and refresh the page.");
              break;
            case 'no-speech':
              setSpeechRecognitionError("No speech was detected. Please try speaking again.");
              break;
            case 'audio-capture':
              setSpeechRecognitionError("No microphone was found. Please check your microphone connection.");
              break;
            case 'network':
              setSpeechRecognitionError("Network error occurred. Speech recognition may not be available offline.");
              break;
            case 'service-not-allowed':
              setSpeechRecognitionError("Speech recognition service is not allowed. Please check your browser settings.");
              break;
            case 'aborted':
              setSpeechRecognitionError(null);
              break;
            default:
              setSpeechRecognitionError(`Speech recognition error: ${event.error}. Please try again.`);
          }
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended (reset), full transcript:', resetFullTranscript);
          setIsListening(false);
          setInterimTranscript("");
          
          if (resetFullTranscript.trim()) {
            console.log('Sending message (reset):', resetFullTranscript.trim());
            handleSendMessage(resetFullTranscript.trim());
            setTranscription("");
            resetFullTranscript = ''; // Clear the captured transcript
          } else {
            console.log('No transcript to send (reset)');
          }
        };
        
        setIsSpeechRecognitionSupported(true);
        toast({
          title: "Speech Recognition Reset",
          description: "Speech recognition has been reset. Please try again.",
        });
        
      } catch (error) {
        console.error("Error reinitializing speech recognition:", error);
        setIsSpeechRecognitionSupported(false);
        setSpeechRecognitionError("Failed to reinitialize speech recognition. Please refresh the page.");
      }
    } else {
      setIsSpeechRecognitionSupported(false);
      setSpeechRecognitionError("Speech recognition is not supported in your browser.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <NavLink to="/workspace">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </NavLink>
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Voice Chat</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Volume2 className="h-3 w-3 mr-1" />
              Speaking
            </Badge>
          )}
          {isListening && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <span className="animate-pulse">●</span>
              <span className="ml-1">Listening</span>
            </Badge>
          )}
          
          {/* Machine Selector - Only show if needed */}
          {selectedMachine && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {selectedMachine}
              <button 
                onClick={() => setSelectedMachine(null)}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                title="Clear selection"
              >
                ✕
              </button>
            </Badge>
          )}
          
          {/* Optional manual selector (less prominent) */}
          {machines.length > 0 && !selectedMachine && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  Manual Select
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Manual Machine Selection</h4>
                  <p className="text-xs text-muted-foreground">Or just mention the machine name in your speech</p>
                  <Select 
                    value={selectedMachine || ""} 
                    onValueChange={(value) => setSelectedMachine(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a machine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific machine</SelectItem>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.name}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Error alerts */}
      {permissionDenied && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Microphone Access Denied</AlertTitle>
          <AlertDescription>
            Please allow microphone access in your browser settings to use voice chat.
          </AlertDescription>
        </Alert>
      )}
      
      {speechRecognitionError && !permissionDenied && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Speech Recognition Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{speechRecognitionError}</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetSpeechRecognition}
                className="bg-white/10 hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Speech Recognition
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="bg-white/10 hover:bg-white/20"
              >
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages
            .filter(message => message.sender !== "system") // Don't display system messages
            .map((message) => {
              const time = message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              const isUser = message.sender === 'user';
              
              return (
                <div key={message.id} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-600 text-white text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      isUser 
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                    <div className={`text-xs mt-1 px-2 ${
                      isUser ? 'text-violet-600' : 'text-muted-foreground'
                    }`}>
                      {time}
                    </div>
                  </div>

                  {/* Play button for bot messages */}
                  {!isUser && !isSpeaking && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full mt-1"
                      onClick={() => playTTS(message.content)}
                      title="Play message"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isUser && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-600 text-white text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Voice Controls */}
      <div className="p-4 border-t bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Real-time transcript display */}
          {(isListening || displayText) && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-muted-foreground">
                  {isListening ? "Listening..." : "Transcript"}
                </div>
                {!isListening && displayText && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (displayText.trim()) {
                        console.log('Manual send:', displayText.trim());
                        handleSendMessage(displayText.trim());
                        setTranscription("");
                        setInterimTranscript("");
                      }
                    }}
                  >
                    Send
                  </Button>
                )}
              </div>
              <div className="text-sm min-h-[20px]">
                {displayText || (isListening ? "Speak now..." : "")}
                {isListening && <span className="inline-block w-2 h-4 bg-red-500 animate-pulse ml-1"></span>}
              </div>
              {isListening && volumeLevel > 0 && (
                <div className="mt-2">
                  <Progress value={volumeLevel} className="h-1" />
                </div>
              )}
            </div>
          )}

          {/* Control buttons */}
          <div className="flex justify-center items-center gap-4">
            {/* Text chat link */}
            <Button variant="outline" size="icon" asChild>
              <NavLink to="/workspace">
                <MessageSquare className="h-5 w-5" />
              </NavLink>
            </Button>

            {/* Reset button (visible when there are errors) */}
            {(speechRecognitionError || !isSpeechRecognitionSupported) && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetSpeechRecognition}
                title="Reset Speech Recognition"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            )}

            {/* Main microphone button */}
            <Button
              onClick={toggleListening}
              disabled={isProcessing || !isSpeechRecognitionSupported || permissionDenied}
              size="lg"
              className={`h-16 w-16 rounded-full transition-all shadow-lg ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white'
              }`}
            >
              {isListening ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* Stop speaking button */}
            {isSpeaking && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }}
              >
                <Square className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="text-center mt-3 text-xs text-muted-foreground">
            {!isSpeechRecognitionSupported 
              ? "Speech recognition not supported in this browser" 
              : permissionDenied 
              ? "Microphone access denied" 
              : isListening 
              ? "Speak now... Tap to stop" 
              : "Tap the microphone to start speaking"
            }
          </div>
        </div>
      </div>
    </div>
  );
}
