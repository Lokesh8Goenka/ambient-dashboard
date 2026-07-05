import { getDailyQuote } from "@/lib/quotes";

export default function Quote() {
  const quote = getDailyQuote();

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-3xl text-indigo-300 leading-none mb-3 font-serif">&ldquo;</div>
      <p className="text-gray-700 text-base leading-relaxed italic">
        {quote.text}
      </p>
      <p className="mt-3 text-sm text-gray-400 font-medium">— {quote.author}</p>
    </div>
  );
}
