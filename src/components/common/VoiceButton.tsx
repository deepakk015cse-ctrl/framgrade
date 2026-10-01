import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Check, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { farmerNotifications } from '../../services/notificationService';


interface VoiceButtonProps {
  onTranscript?: (transcript: string) => void;
  label?: string;
  variant?: 'inline' | 'floating' | 'banner' | 'large';
  speakHelpText?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  label,
  variant = 'inline',
  speakHelpText
}) => {
  const { language, addToast } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const defaultLabels: Record<string, string> = {
    en: '🎤 Speak',
    ta: '🎤 பேசுங்கள்',
    hi: '🎤 बोलें'
  };

  const activeLabel = label || defaultLabels[language] || defaultLabels.en;

  const sampleVoicePhrases: Record<string, { label: string; text: string }[]> = {
    ta: [
      { label: '🍅 தக்காளி 200 கிலோ', text: 'தக்காளி 200 கிலோ பென்னாகரம்' },
      { label: '🧅 வெங்காயம் 30 குவிண்டால்', text: 'வெங்காயம் 30 குவிண்டால் தாராபுரம்' },
      { label: '🥔 உருளைக்கிழங்கு 80 மூட்டைகள்', text: 'உருளைக்கிழங்கு 80 மூட்டைகள் மேட்டுப்பாளையம்' }
    ],
    hi: [
      { label: '🍅 टमाटर 200 किलो', text: 'टमाटर 200 किलो पेन्नागरम' },
      { label: '🧅 प्याज 30 क्विंटल', text: 'प्याज 30 क्विंटल' },
      { label: '🥔 आलू 80 बोरी', text: 'आलू 80 बोरी' }
    ],
    en: [
      { label: '🍅 Tomato', text: 'Tomato' },
      { label: '⚖️ 200 kilograms', text: '200 kilograms' },
      { label: '📍 Pennagaram', text: 'Pennagaram' }
    ]
  };

  // Text-to-speech helper for low-literacy farmers
  const handleSpeakAloud = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const textToSpeak = speakHelpText || (
      language === 'ta'
        ? 'உங்கள் விளைபொருளின் விவரங்களை குரல் மூலம் எளிதாக பதிவு செய்யலாம். மைக் பட்டனை அழுத்தவும்.'
        : language === 'hi'
        ? 'माइक दबाकर अपनी फसल का नाम और मात्रा बोलें।'
        : 'Tap the microphone and speak your crop name and quantity.'
    );

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFallbackReason('Speech recognition is not directly supported in this browser. You can select your voice command below with 1 tap:');
      setShowFallbackModal(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        addToast(farmerNotifications.voiceListening(true, language));
        setTranscriptPreview(
          language === 'ta'
            ? 'கேட்கிறது... இப்போது பேசவும்.'
            : language === 'hi'
            ? 'सुन रहा है... कृपया अब बोलें।'
            : 'Listening... Please speak now.'
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        setTranscriptPreview(currentText);

        if (final) {
          setIsListening(false);
          onTranscript?.(final);
          addToast({
            type: 'success',
            title: language === 'ta' ? 'புரிந்தது.' : language === 'hi' ? 'समझ गया।' : 'Got it.',
            message: `"${final}"`
          });
          setTimeout(() => setTranscriptPreview(null), 3500);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast(farmerNotifications.voiceFailed(language));
        setFallbackReason(
          language === 'ta'
            ? 'மன்னிக்கவும், எங்களால் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : language === 'hi'
            ? 'क्षमा करें, हम सुन नहीं सके। कृपया पुनः प्रयास करें।'
            : "Sorry, we couldn't hear that. Please try again."
        );
        setShowFallbackModal(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setFallbackReason(
        language === 'ta'
          ? 'குரல் உள்ளீடு தயார். கீழே உள்ள பயிரைத் தொடவும்:'
          : language === 'hi'
          ? 'आवाज विकल्प तैयार है। नीचे किसी भी विकल्प को चुनें:'
          : 'Voice input is ready. Tap any common phrase below:'
      );
      setShowFallbackModal(true);
    }
  };

  const handleSelectPreset = (phrase: string) => {
    setShowFallbackModal(false);
    setTranscriptPreview(phrase);
    onTranscript?.(phrase);
    addToast({
      type: 'success',
      title: language === 'ta' ? 'விவரம் பதிவு செய்யப்பட்டது' : language === 'hi' ? 'विवरण दर्ज किया गया' : 'Voice Input Applied',
      message: `"${phrase}"`
    });
    setTimeout(() => setTranscriptPreview(null), 3500);
  };

  const currentPresets = sampleVoicePhrases[language] || sampleVoicePhrases.en;

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-emerald-700/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 flex items-center justify-center shrink-0 border border-emerald-500/50 shadow-inner">
              <Mic className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-lg sm:text-xl text-white">
                  {language === 'ta'
                    ? 'குரல் வழி பதிவு உதவி'
                    : language === 'hi'
                    ? 'बोलकर फसल दर्ज करें'
                    : 'Farmer Voice Assistant'}
                </h4>
                <button
                  type="button"
                  onClick={handleSpeakAloud}
                  title="Listen instructions aloud"
                  className="p-1 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-emerald-200/90 text-sm mt-0.5">
                {language === 'ta'
                  ? 'டைப் செய்ய வேண்டிய அவசியமில்லை. தமிழில், இந்தியில் அல்லது ஆங்கிலத்தில் பேசலாம்.'
                  : language === 'hi'
                  ? 'लिखने की जरूरत नहीं। अपनी भाषा में बोलकर फसल जोड़ें।'
                  : 'Zero typing required. Speak naturally in Tamil, Hindi, or English.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleStartVoice}
              disabled={isListening}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-md active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-3.5 h-3.5 bg-white rounded-full animate-ping" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 text-stone-950" />
                  <span>{activeLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {transcriptPreview && (
          <div className="mt-4 p-3 bg-emerald-800/70 border border-emerald-600 rounded-xl text-sm font-semibold text-emerald-100 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">{transcriptPreview}</span>
          </div>
        )}

        {/* Fallback modal */}
        {showFallbackModal && (
          <VoiceFallbackModal
            reason={fallbackReason}
            presets={currentPresets}
            onSelect={handleSelectPreset}
            onClose={() => setShowFallbackModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={handleStartVoice}
          disabled={isListening}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 border-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
            isListening
              ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
              : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-950'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-6 h-6 animate-bounce" />
              <span>Listening... Speak Now</span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6 text-emerald-800" />
              <span>{activeLabel}</span>
              <Volume2
                onClick={handleSpeakAloud}
                className="w-5 h-5 text-emerald-700 ml-1 hover:text-emerald-950 cursor-pointer"
              />
            </>
          )}
        </button>

        {transcriptPreview && (
          <div className="mt-2 text-xs font-semibold text-emerald-900 bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{transcriptPreview}</span>
          </div>
        )}

        {showFallbackModal && (
          <VoiceFallbackModal
            reason={fallbackReason}
            presets={currentPresets}
            onSelect={handleSelectPreset}
            onClose={() => setShowFallbackModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleStartVoice}
          disabled={isListening}
          title="Voice input in Tamil, Hindi, or English"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-50 border-rose-500 text-rose-700 animate-pulse'
              : 'bg-emerald-50 border-emerald-400 text-emerald-900 hover:bg-emerald-100'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-700" />
              <span>{activeLabel}</span>
            </>
          )}
        </button>

        {speakHelpText && (
          <button
            type="button"
            onClick={handleSpeakAloud}
            title="Read instructions aloud"
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer border border-stone-200"
          >
            <Volume2 className="w-4 h-4 text-stone-600" />
          </button>
        )}
      </div>

      {transcriptPreview && (
        <span className="text-xs text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg font-medium border border-emerald-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          {transcriptPreview}
        </span>
      )}

      {showFallbackModal && (
        <VoiceFallbackModal
          reason={fallbackReason}
          presets={currentPresets}
          onSelect={handleSelectPreset}
          onClose={() => setShowFallbackModal(false)}
        />
      )}
    </div>
  );
};

// Helpful voice fallback modal for low-literacy farmers
interface VoiceFallbackModalProps {
  reason: string | null;
  presets: { label: string; text: string }[];
  onSelect: (phrase: string) => void;
  onClose: () => void;
}

const VoiceFallbackModal: React.FC<VoiceFallbackModalProps> = ({
  reason,
  presets,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-xl border-2 border-stone-200 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Voice Input Assistance</h3>
              <p className="text-xs text-stone-500">Zero-typing farmer assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {reason && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        )}

        <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          Tap any spoken phrase to fill instantly:
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {presets.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item.text)}
              className="w-full p-3 rounded-xl border-2 border-stone-200 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-sm text-stone-900 group-hover:text-emerald-950">
                  {item.label}
                </div>
                <div className="text-xs text-stone-500 italic mt-0.5">"{item.text}"</div>
              </div>
              <Check className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
            </button>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
