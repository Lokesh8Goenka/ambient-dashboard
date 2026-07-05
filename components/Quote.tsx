import { getDailyQuote } from "@/lib/quotes";

export default function Quote() {
  const quote = getDailyQuote();

  return (
    <div className="flex items-center gap-4">
      <div className="text-4xl text-indigo-200 leading-none font-serif select-none flex-shrink-0">&ldquo;</div>
      <div className="min-w-0">
        <p className="text-gray-700 text-sm md:text-base leading-relaxed italic">
          {quote.text}
        </p>
        <p className="mt-1 text-xs text-gray-400 font-medium">— {quote.author}</p>
      </div>
    </div>
  );
}
