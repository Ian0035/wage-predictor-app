'use client'; // if using App Router

import { useState } from 'react';
import { useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [structuredData, setStructuredData] = useState(null);
  const [missingField, setMissingField] = useState<string | null>(null);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [predictedWage, setPredictedWage] = useState<string | null>(null);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (message: string) => {
    // Append user message to chat
    const updatedMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(updatedMessages);
    setInput('');

    // Build the conversation into one text block for LLM
    const fullText = updatedMessages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('. ');

    const res = await fetch('https://wage-predictor-app-backend.onrender.com/wage/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullText }),
    });

    const data = await res.json();
    setStructuredData(data);

    if (data.missingFields.length > 0) {
      const next = data.nextQuestion || `Can you tell me your ${data.missingFields[0]}?`;
      setNextQuestion(next);
      setMissingField(data.missingFields[0]);
      setMessages([...updatedMessages, { role: 'assistant', content: next }]);
    } else {
        setNextQuestion(null);
        setMissingField(null);
        setMessages([...updatedMessages, { role: 'assistant', content: 'Thanks! I have everything I need.' }]);

        // 🔥 Call the R Plumber API
        try {
          const predictRes = await fetch('https://wage-predictor-app-backend.onrender.com/wage/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              age: data.age,
              years_experience: data.years_experience,
              education: data.education,
              gender: data.gender,
              country: data.country,
              industry: data.industry,
            }),
          });

          const prediction = await predictRes.json();
          console.log('Prediction response:', prediction);

          const wage = Number(prediction.predictedWage);
          const formatted = isNaN(wage) ? 'N/A' : wage.toFixed(2);

          setPredictedWage(`$${formatted}`);

          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `Your predicted wage is **$${formatted}**.` }
          ]);
        }  catch (error) {
              console.error('Frontend error calling /predict:', error); // <— add this line
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, there was an error making the prediction.' }
              ]);

        }
      }

        };

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage(input.trim());
  };

  return (
  <div className="min-h-screen bg-black flex flex-col relative">
    <AnimatePresence>
      {messages.length === 0 && (
        <>
          {/* Back lines (left + bottom) */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-[22%] sm:top-[46%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[180px] h-[160px] sm:w-[250px] sm:h-[220px] md:w-[300px] md:h-[260px] 
                      z-0 pointer-events-none"
          >
            <svg
              viewBox="0 0 300 260"
              className="glow-triangle absolute w-full h-full scale-[1.2] sm:scale-[1.5] md:scale-[2] pointer-events-none"
            >
              <line x1="10" y1="250" x2="150" y2="10" stroke="#00FF88" strokeWidth="4" />
              <line x1="290" y1="250" x2="10" y2="250" stroke="#00FF88" strokeWidth="4" />
            </svg>
          </motion.div>

          {/* Top line (foreground) */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-[22%] sm:top-[46%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[180px] h-[160px] sm:w-[250px] sm:h-[220px] md:w-[300px] md:h-[260px] 
                      z-20 pointer-events-none"
          >
            <svg
              viewBox="0 0 300 260"
              className="glow-triangle absolute w-full h-full scale-[1.2] sm:scale-[1.5] md:scale-[2] pointer-events-none"
            >
              <line x1="150" y1="10" x2="290" y2="250" stroke="#00FF88" strokeWidth="4" />
            </svg>
          </motion.div>

          {/* Full triangle outline (z-10, optional) */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-[22%] sm:top-[46%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[180px] h-[160px] sm:w-[250px] sm:h-[220px] md:w-[300px] md:h-[260px] 
                      z-0"
          >
            <svg
              viewBox="0 0 300 260"
              className="w-full h-full scale-[1.2] sm:scale-[1.5] md:scale-[2]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="150,10 290,250 10,250"
                stroke="#00FF88"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </motion.div>
        </>
      )}
    </AnimatePresence>


    {/* Background gradient */}
    {/* Background circles */}
    <div className="circle circle1" />
    <div className="circle circle2" />
    <div className="circle circle3" />
    <div className="circle circle4" />
  <div className={` ${
                messages.length === 0
                  ? 'mt-auto mb-auto'
                  : 'min-h-screen flex flex-col items-center px-4'
              }`}>
  <motion.main
    className="w-full max-w-2xl mx-auto p-6 flex flex-col space-y-4 flex-grow"
    layout
    transition={{ duration: 0.8, ease: 'easeInOut' }}
  >
    {/* Title */}
    <motion.h1
      className="mb-4 text-3xl font-extrabold text-white md:text-5xl lg:text-6xl text-center z-10 pb-2 flex-none"
      initial={{ opacity: 0, y: -80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Use AI</span> to predict your wage
    </motion.h1>

    <AnimatePresence>
      {messages.length > 0 && (
        <motion.div
          key="chat"
          layout
          className="rounded space-y-4 flex flex-col flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Scrollable message box */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`w-fit max-w-10/12 py-2 px-3 mx-3 my-3 rounded-lg text-white relative ${
                  msg.role === 'user'
                    ? 'bg-black/30 border-2 border-green-400 shadow-[0_0_12px_2px_#00FF88] self-end ml-auto'
                    : 'bg-black/30 border-2 border-blue-400 shadow-[0_0_12px_2px_#00CCFF] self-start mr-auto'
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx === 0 || idx === 1 ? 1 : 0,
                  duration: 0.3,
                }}
              >
                {msg.content}
                <div ref={messagesEndRef} />
              </motion.div>
              
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
        {predictedWage && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        z-50 bg-black/80 border-4 border-green-400 text-white shadow-[0_0_12px_2px_#00FF88]
                        px-8 py-6 rounded-2xl text-3xl text-center space-y-4 backdrop-blur-lg"
            >
              <div>
                Your predicted wage is <span className="text-green-300 text-4xl">{predictedWage}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>



    {/* Input form */}
    <motion.form
      onSubmit={handleSubmit}
      className="w-full ml-auto mr-auto max-w-xl flex sm:flex-row flex-col gap-2 items-stretch h-12 z-10"
      layout
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <input
        type="text"
        className="flex-1 h-full p-3 rounded-xl border-2 placeholder-gray-300 border-white text-white"
        placeholder="Describe yourself (e.g. I'm 39, live in Copenhagen...)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="submit"
        className={`h-full min-h-10 px-4 rounded-xl ${
          missingField ? 'bg-gray-600 text-white' : 'bg-green-500 text-white'
        }`}
      >
        {missingField ? 'Continue' : 'Predict'}
      </button>
    </motion.form>
  </motion.main>
</div>
</div>
  );
}

