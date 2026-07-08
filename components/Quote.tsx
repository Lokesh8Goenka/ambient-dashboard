import { getDailyQuote } from "@/lib/quotes";

export default function Quote() {
  const quote = getDailyQuote();

  return (
    <div className="flex items-center gap-4">
      <div className="font-serif text-5xl text-indigo-200 dark:text-indigo-500/50 leading-none select-none flex-shrink-0">&ldquo;</div>
      <div className="min-w-0">
        <p className="font-serif italic text-gray-700 dark:text-gray-200 text-base md:text-lg leading-relaxed">
          {quote.text}
        </p>
        <p className="font-display mt-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">— {quote.author}</p>
      </div>
    </div>
  );
}
