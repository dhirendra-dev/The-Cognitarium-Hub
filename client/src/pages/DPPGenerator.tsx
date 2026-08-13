import { useMemo, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Download, Loader, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const CHAPTERS = {
  Physics: ["Mechanics", "Thermodynamics", "Waves and Oscillations", "Electrostatics", "Current Electricity", "Optics", "Modern Physics"],
  Chemistry: ["Some Basic Concepts of Chemistry", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Organic Chemistry", "Coordination Chemistry", "Electrochemistry"],
  Mathematics: ["Sets, Relations and Functions", "Algebra", "Coordinate Geometry", "Calculus", "Vectors and Three-Dimensional Geometry", "Probability", "Trigonometry"],
} as const;

type Subject = keyof typeof CHAPTERS;
type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};
type DPP = {
  id: string;
  subject: Subject;
  chapter: string;
  difficulty: "JEE Main" | "JEE Advanced";
  generatedAt: string;
  questions: Question[];
};

export default function DPPGenerator() {
  const [subject, setSubject] = useState<Subject>("Physics");
  const [chapter, setChapter] = useState<string>(CHAPTERS.Physics[0]);
  const [difficulty, setDifficulty] = useState<"JEE Main" | "JEE Advanced">("JEE Main");
  const [dpp, setDpp] = useState<DPP | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showSolutions, setShowSolutions] = useState(false);
  const generateMutation = trpc.dpp.generate.useMutation({
    onSuccess: (data) => {
      setDpp(data as DPP);
      setAnswers({});
      setShowSolutions(false);
      toast.success("Your practice set is ready.");
    },
    onError: (error) => toast.error(error.message || "Could not generate the practice set."),
  });

  const score = useMemo(() => {
    if (!dpp) return 0;
    const attempted = dpp.questions.filter((question) => answers[question.id] !== undefined);
    if (!attempted.length) return 0;
    const correct = attempted.filter((question) => answers[question.id] === question.correctAnswer).length;
    return Math.round((correct / dpp.questions.length) * 100);
  }, [answers, dpp]);

  const selectSubject = (nextSubject: Subject) => {
    setSubject(nextSubject);
    setChapter(CHAPTERS[nextSubject][0]);
  };

  const generate = () => {
    generateMutation.mutate({ subject, chapter, difficulty, count: 5 });
  };

  const downloadDpp = () => {
    if (!dpp) return;
    const content = [
      `${dpp.subject} — ${dpp.chapter}`,
      `${dpp.difficulty} | Generated ${new Date(dpp.generatedAt).toLocaleString()}`,
      "",
      ...dpp.questions.flatMap((question, index) => [
        `${index + 1}. ${question.question}`,
        ...question.options.map((option, optionIndex) => `   ${String.fromCharCode(65 + optionIndex)}. ${option}`),
        `   Answer: ${String.fromCharCode(65 + question.correctAnswer)}`,
        `   Explanation: ${question.explanation}`,
        "",
      ]),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dpp.subject}-${dpp.chapter.replace(/[^a-z0-9]+/gi, "-")}-dpp.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-300" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-white">DPP Generator</h1>
          </div>
          <p className="text-slate-300">Generate a fresh Daily Practice Problem set for a focused chapter.</p>
        </header>

        {!dpp ? (
          <section className="space-y-6 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl md:p-8">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-200">Subject</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CHAPTERS) as Subject[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectSubject(item)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${subject === item ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="dpp-chapter" className="mb-2 block text-sm font-semibold text-slate-200">Chapter</label>
              <select
                id="dpp-chapter"
                value={chapter}
                onChange={(event) => setChapter(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                {CHAPTERS[subject].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-200">Difficulty</p>
              <div className="flex gap-2">
                {(["JEE Main", "JEE Advanced"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDifficulty(item)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${difficulty === item ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={generateMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {generateMutation.isPending ? <><Loader className="h-5 w-5 animate-spin" /> Generating with Manus AI…</> : <><BookOpen className="h-5 w-5" /> Generate DPP</>}
            </button>
            <p className="text-xs text-slate-400">The questions are generated on demand and validated for four options and one answer key.</p>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">{dpp.difficulty} · {new Date(dpp.generatedAt).toLocaleString()}</p>
                <h2 className="mt-1 text-2xl font-bold text-white">{dpp.subject}: {dpp.chapter}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={downloadDpp} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"><Download className="h-4 w-4" /> Download</button>
                <button type="button" onClick={() => setDpp(null)} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"><RotateCcw className="h-4 w-4" /> New DPP</button>
              </div>
            </div>

            {dpp.questions.map((question, index) => (
              <article key={question.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl">
                <h3 className="font-semibold leading-relaxed text-white">Q{index + 1}. {question.question}</h3>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === optionIndex;
                    const correct = showSolutions && optionIndex === question.correctAnswer;
                    const incorrect = showSolutions && selected && !correct;
                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() => !showSolutions && setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${correct ? "border-emerald-400 bg-emerald-900/50 text-emerald-100" : incorrect ? "border-red-400 bg-red-950/50 text-red-100" : selected ? "border-blue-400 bg-blue-950/50 text-blue-100" : "border-slate-600 bg-slate-800/70 text-slate-300 hover:border-slate-400"}`}
                      >
                        <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                      </button>
                    );
                  })}
                </div>
                {showSolutions && (
                  <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200">
                    <p className="mb-2 inline-flex items-center gap-2 font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Explanation</p>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </article>
            ))}

            <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">Score</p>
                <p className="text-3xl font-bold text-emerald-300">{score}%</p>
                {!showSolutions && <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400"><AlertCircle className="h-3.5 w-3.5" /> Submit your choices by revealing solutions.</p>}
              </div>
              <button type="button" onClick={() => setShowSolutions((value) => !value)} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
                {showSolutions ? "Hide Solutions" : "Reveal Solutions"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
