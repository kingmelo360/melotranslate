import React, { useState, useEffect } from 'react';
import { Languages, ArrowRightLeft, Pause, Play, Settings, Sparkles } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

function App() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoice(voices[0]);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const translateText = async () => {
      if (!sourceText.trim()) {
        setTargetText('');
        return;
      }

      setIsTranslating(true);
      setError('');

      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            sourceText
          )}&langpair=${sourceLanguage}|${targetLanguage}`
        );

        const data = await response.json();

        if (data.responseStatus === 200) {
          setTargetText(data.responseData.translatedText);
        } else {
          setError('Translation failed. Please try again.');
        }
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setIsTranslating(false);
      }
    };

    const timeoutId = setTimeout(translateText, 500);
    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Languages className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Melo Translation Pro</h1>
              <p className="text-xs sm:text-sm text-gray-500">Professional Translation Suite</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-white/50 transition-colors" title="Settings">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Translation Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Language Selection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
              <select 
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleSwapLanguages}
              className="mx-2 sm:mx-4 p-2 sm:p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors group"
            >
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white transform group-hover:rotate-180 transition-transform" />
            </button>

            <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translation Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-100">
            {/* Source Text */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Source Text</span>
                    <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                      {LANGUAGES.find(l => l.code === sourceLanguage)?.name}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSpeak(sourceText, sourceLanguage)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                    disabled={!sourceText}
                  >
                    {isPlaying ? (
                      <Pause className={`w-4 h-4 ${sourceText ? 'text-blue-600' : 'text-gray-300'}`} />
                    ) : (
                      <Play className={`w-4 h-4 ${sourceText ? 'text-gray-600' : 'text-gray-300'}`} />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Voice:</span>
                  <select
                    value={selectedVoice?.name}
                    onChange={(e) => setSelectedVoice(availableVoices.find(v => v.name === e.target.value) || null)}
                    className="flex-1 text-sm p-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full h-36 sm:h-48 resize-none focus:outline-none text-gray-800 placeholder-gray-400 mt-3"
              />
            </div>

            {/* Target Text */}
            <div className="p-4 sm:p-6 border-t lg:border-t-0">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Translation</span>
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                    {LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </div>
                </div>
                <button 
                  onClick={() => handleSpeak(targetText, targetLanguage)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={!targetText}
                >
                  {isPlaying ? (
                    <Pause className={`w-4 h-4 ${targetText ? 'text-blue-600' : 'text-gray-300'}`} />
                  ) : (
                    <Play className={`w-4 h-4 ${targetText ? 'text-gray-600' : 'text-gray-300'}`} />
                  )}
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={targetText}
                  placeholder={isTranslating ? 'Translating...' : 'Translation will appear here...'}
                  className="w-full h-36 sm:h-48 resize-none focus:outline-none text-gray-800 placeholder-gray-400"
                  readOnly
                />
                {isTranslating && (
                  <div className="absolute top-0 right-0 m-2">
                    <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  </div>
                )}
                {error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-50 text-red-600 p-3 text-sm border-t border-red-100">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Powered by MyMemory Translation API • Melo Translation Pro
        </div>
      </div>
    </div>
  );
}

export default App;