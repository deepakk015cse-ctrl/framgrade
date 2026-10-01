import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, RotateCcw, X, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { farmerNotifications } from '../../services/notificationService';


export interface VoiceInputProps {
  /** Purpose of the voice input for contextual hints and parsing */
  mode?: 'crop' | 'quantity' | 'location' | 'search' | 'general';
  /** Current value of the field */
  value?: string;
  /** Callback fired ONLY after the user explicitly confirms the recognized text */
  onConfirm: (text: string) => void;
  /** Custom prompt text displayed during listening and dialog */
  prompt?: string;
  /** Placeholder for search / inline mode */
  placeholder?: string;
  /** Visual variant: 'button' (standalone mic button) | 'input-addon' (inside input box) | 'full-card' */
  variant?: 'button' | 'input-addon' | 'full-card';
  /** Additional custom class names */
  className?: string;
  /** Screen reader / ARIA label */
  ariaLabel?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  mode = 'general',
  value = '',
  onConfirm,
  prompt,
  placeholder,
  variant = 'button',
  className = '',
  ariaLabel,
}) => {
  const { language, t, addToast } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Contextual fallback suggestions for easy tap in rural/noisy environments
  const contextualSuggestions: Record<string, Record<string, string[]>> = {
    crop: {
      ta: ['தக்காளி', 'வெங்காயம்', 'உருளைக்கிழங்கு', 'நெல்', 'வாழை'],
      hi: ['टमाटर', 'प्याज', 'आलू', 'धान', 'केला'],
      en: ['Tomato', 'Onion', 'Potato', 'Paddy', 'Banana'],
    },
    quantity: {
      ta: ['500 கிலோ', '300 கிலோ', '50 மூட்டை', '30 குவிண்டால்'],
      hi: ['500 किलो', '300 किलो', '50 बोरी', '30 क्विंटल'],
      en: ['500 kg', '300 kg', '50 bags', '30 quintals'],
    },
    location: {
      ta: ['ஒட்டன்சத்திரம்', 'தாராபுரம்', 'பொள்ளாச்சி', 'மேட்டுப்பாளையம்', 'நாமக்கல்'],
      hi: ['ओड्डनचत्रम', 'धारापुरम', 'पोलाची', 'मेट्टुपालयम', 'नामक्कल'],
      en: ['Oddanchatram', 'Dharapuram', 'Pollachi', 'Mettupalayam', 'Namakkal'],
    },
    search: {
      ta: ['தக்காளி', 'வெங்காயம்', 'ஒட்டன்சத்திரம் மண்டி'],
      hi: ['टमाटर', 'प्याज', 'मंडी भाव'],
      en: ['Tomato', 'Onion', 'Mandi Prices'],
    },
    general: {
      ta: ['தக்காளி 500 கிலோ', 'வெங்காயம் 30 குவிண்டால்'],
      hi: ['टमाटर 500 किलो', 'प्याज 30 क्विंटल'],
      en: ['Tomato 500 kg', 'Onion 30 quintals'],
    },
  };

  const getLanguageTag = () => {
    if (language === 'ta') return 'ta-IN';
    if (language === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  const getDefaultPrompt = () => {
    if (prompt) return prompt;
    if (mode === 'crop') return t('voice_crop_prompt');
    if (mode === 'quantity') return t('voice_quantity_prompt');
    if (mode === 'location') return t('voice_location_prompt');
    if (mode === 'search') return t('voice_search_placeholder');
    return t('voice_assistant_desc');
  };

  // Text-To-Speech read-aloud for digital/rural accessibility
  const handleReadAloud = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = getLanguageTag();
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Start browser speech recognition
  const handleStartListening = () => {
    setAudioError(null);
    setInterimText('');
    setRecognizedText(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without speech recognition
      setRecognizedText('');
      setEditedText(value || '');
      setShowConfirmModal(true);
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
      recognition.lang = getLanguageTag();

      recognition.onstart = () => {
        setIsListening(true);
        addToast(farmerNotifications.voiceListening(mode === 'crop', language));
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimText(interim);
        }

        if (final) {
          const cleaned = final.trim();
          setRecognizedText(cleaned);
          setEditedText(cleaned);
          setIsListening(false);
          setShowConfirmModal(true);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast(farmerNotifications.voiceFailed(language));
        setAudioError(
          language === 'ta'
            ? 'மன்னிக்கவும், எங்களால் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : language === 'hi'
            ? 'क्षमा करें, हम सुन नहीं सके। कृपया पुनः प्रयास करें।'
            : "Sorry, we couldn't hear that. Please try again."
        );
        setShowConfirmModal(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setAudioError(
        language === 'ta'
          ? 'மன்னிக்கவும், எங்களால் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : language === 'hi'
          ? 'क्षमा करें, हम सुन नहीं सके। कृपया पुनः प्रयास करें।'
          : "Sorry, we couldn't hear that. Please try again."
      );
      setShowConfirmModal(true);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (interimText) {
      setRecognizedText(interimText);
      setEditedText(interimText);
      setShowConfirmModal(true);
    }
  };

  // User explicitly confirms speech input (Never silent submit!)
  const handleConfirm = () => {
    const finalText = editedText.trim();
    if (finalText) {
      onConfirm(finalText);
      addToast({
        type: 'success',
        title: 'Got it.',
        message: `"${finalText}"`,
      });
    }
    setShowConfirmModal(false);
    setRecognizedText(null);
    setInterimText('');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setRecognizedText(null);
    setInterimText('');
    setAudioError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const suggestions = contextualSuggestions[mode]?.[language] || contextualSuggestions.general[language] || [];

  return (
    <>
      {/* 1. Trigger Component */}
      {variant === 'input-addon' ? (
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`px-3 py-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-center cursor-pointer min-w-[48px] min-h-[48px] ${
            isListening ? 'text-rose-600 bg-rose-50 animate-pulse' : ''
          } ${className}`}
          aria-label={ariaLabel || t('voice_tap_to_speak')}
          title={t('voice_tap_to_speak')}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-rose-600" />
          ) : (
            <Mic className="w-5 h-5 text-emerald-700" />
          )}
        </button>
      ) : variant === 'full-card' ? (
        <div className={`p-4 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 ${className}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase text-emerald-900 tracking-wider">
                  {t('voice_assistant_title')}
                </p>
                <p className="text-sm font-semibold text-stone-700">
                  {getDefaultPrompt()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`px-4 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm min-w-[130px] justify-center min-h-[48px] ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? t('voice_listening') : t('voice_speak_help')}</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-xs min-h-[48px] min-w-[48px] ${
            isListening
              ? 'bg-rose-600 border-rose-700 text-white animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
          } ${className}`}
          aria-label={ariaLabel || t('voice_tap_to_speak')}
        >
          {isListening ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <MicOff className="w-4 h-4" />
              <span className="font-extrabold">{t('voice_listening')}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-700" />
              <span>{t('voice_speak_help')}</span>
            </>
          )}
        </button>
      )}

      {/* 2. Active "Listening..." Live Overlay Bar */}
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-6 py-4 rounded-3xl shadow-2xl border-2 border-emerald-500/50 flex items-center gap-4 animate-bounce max-w-md w-11/12"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping" />
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-black uppercase text-emerald-400 tracking-wider">
              {t('voice_listening')}
            </p>
            <p className="text-sm font-semibold truncate text-stone-200">
              {interimText || getDefaultPrompt()}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStopListening}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-bold text-stone-300 min-h-[44px]"
          >
            Done
          </button>
        </div>
      )}

      {/* 3. Explicit User Speech Confirmation Dialog (Never Silently Submit) */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-modal-title"
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-stone-300 shadow-2xl p-6 text-left space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="voice-modal-title" className="text-lg font-black text-stone-900">
                    {t('voice_confirm_title')}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Review and confirm before applying. You can edit text directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('voice_cancel')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {audioError && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Recognized Text Display & Direct Edit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-stone-600 tracking-wider">
                  {t('voice_recognized_text')}
                </label>
                {editedText && (
                  <button
                    type="button"
                    onClick={() => handleReadAloud(editedText)}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 min-h-[36px]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder={getDefaultPrompt()}
                  className="w-full text-base sm:text-lg font-bold p-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/20 text-stone-900 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>

            {/* Quick 1-Tap Suggestions for Rural Ease */}
            {suggestions.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <p className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
                  Tap to quickly pick:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditedText(sug)}
                      className="px-3 py-2 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-950 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 transition-colors cursor-pointer min-h-[44px]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Explicit Confirmation Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartListening}
                className="px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('voice_try_again')}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!editedText.trim()}
                className="px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all min-h-[48px]"
              >
                <Check className="w-5 h-5" />
                <span>{t('voice_use_this')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
