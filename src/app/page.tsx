'use client'; // if using App Router

import { useState } from 'react';

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
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">AI Wage Predictor</h1>

      <div className="bg-gray-100 text-amber-600 p-4 rounded h-[400px] overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto'
                : 'bg-white text-black self-start mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          className="flex-grow p-3 border rounded"
          placeholder="Describe yourself (e.g. I'm 39, live in Copenhagen...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded ${
            missingField ? 'bg-gray-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {missingField ? 'Continue' : 'Predict'}
        </button>
      </form>

      {structuredData && !missingField && (
        <div className="bg-green-100 p-3 rounded">
          <h2 className="font-semibold">Final structured input:</h2>
          <pre className="text-sm mt-2">{JSON.stringify(structuredData, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
