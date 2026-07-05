import { getDailyQuote } from "@/lib/quotes";

export default function Quote() {
  const quote = getDailyQuote();

  return (
    <div className="flex items-center gap-4">
      <div className="font-serif text-5xl text-indigo-200 leading-none select-none flex-shrink-0">&ldquo;</div>
      <div className="min-w-0">
        <p className="font-serif italic text-gray-700 text-base md:text-lg leading-relaxed">
          {quote.text}
        </p>
        <p className="font-display mt-1.5 text-xs text-gray-400 font-medium tracking-wide">— {quote.author}</p>
      </div>
    </div>
  );
}
