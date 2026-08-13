import { useState } from "react";
import { Edit3, Loader, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const CLASS_OPTIONS = [
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
  { value: "jeeMain", label: "JEE Main" },
  { value: "jeeAdvanced", label: "JEE Advanced" },
] as const;

type SyllabusClass = (typeof CLASS_OPTIONS)[number]["value"];
type Difficulty = "easy" | "medium" | "hard";
type FormState = {
  subject: string;
  unit: string;
  topic: string;
  subtopic: string;
  class: SyllabusClass;
  weightage: string;
  difficulty: Difficulty;
  conceptsRequired: string;
};

const EMPTY_FORM: FormState = {
  subject: "Mathematics",
  unit: "",
  topic: "",
  subtopic: "",
  class: "jeeMain",
  weightage: "",
  difficulty: "medium",
  conceptsRequired: "",
};

export function AdminSyllabusTab() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const syllabusQuery = trpc.syllabus.list.useQuery({});
  const utils = trpc.useUtils();
  const refresh = async () => {
    await utils.syllabus.list.invalidate();
    setForm(EMPTY_FORM);
    setEditingId(null);
  };
  const createMutation = trpc.syllabus.create.useMutation({
    onSuccess: async () => { toast.success("Syllabus topic added."); await refresh(); },
    onError: (error) => toast.error(error.message || "Could not add topic."),
  });
  const updateMutation = trpc.syllabus.update.useMutation({
    onSuccess: async () => { toast.success("Syllabus topic updated."); await refresh(); },
    onError: (error) => toast.error(error.message || "Could not update topic."),
  });
  const deleteMutation = trpc.syllabus.delete.useMutation({
    onSuccess: async () => { toast.success("Syllabus topic deleted."); await utils.syllabus.list.invalidate(); },
    onError: (error) => toast.error(error.message || "Could not delete topic."),
  });

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.unit.trim() || !form.topic.trim()) {
      toast.error("Unit and topic are required.");
      return;
    }
    const payload = {
      subject: form.subject.trim(),
      unit: form.unit.trim(),
      topic: form.topic.trim(),
      subtopic: form.subtopic.trim() || undefined,
      class: form.class,
      weightage: form.weightage ? Number(form.weightage) : undefined,
      difficulty: form.difficulty,
      conceptsRequired: form.conceptsRequired.trim() || undefined,
    };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  };

  const startEdit = (topic: any) => {
    setEditingId(topic.id);
    setForm({
      subject: topic.subject,
      unit: topic.unit,
      topic: topic.topic,
      subtopic: topic.subtopic || "",
      class: topic.class,
      weightage: topic.weightage ? String(topic.weightage) : "",
      difficulty: topic.difficulty || "medium",
      conceptsRequired: topic.conceptsRequired || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-indigo-950">Syllabus topic management</h2>
            <p className="mt-1 text-sm text-indigo-800">Use this form to publish the Mathematics, Physics, and Chemistry rows from the source PDF.</p>
          </div>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700"><X className="h-4 w-4" /> Cancel edit</button>}
        </div>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <input value={form.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="Subject" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" required />
          <input value={form.unit} onChange={(event) => updateField("unit", event.target.value)} placeholder="Unit / chapter group" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" required />
          <input value={form.topic} onChange={(event) => updateField("topic", event.target.value)} placeholder="Topic" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" required />
          <input value={form.subtopic} onChange={(event) => updateField("subtopic", event.target.value)} placeholder="Subtopic (optional)" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" />
          <select value={form.class} onChange={(event) => updateField("class", event.target.value as SyllabusClass)} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm">
            {CLASS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={form.difficulty} onChange={(event) => updateField("difficulty", event.target.value as Difficulty)} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm">
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <input type="number" min="0" max="100" step="0.01" value={form.weightage} onChange={(event) => updateField("weightage", event.target.value)} placeholder="Weightage % (optional)" className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm" />
          <textarea value={form.conceptsRequired} onChange={(event) => updateField("conceptsRequired", event.target.value)} placeholder="Core concepts / prerequisites (optional)" className="min-h-20 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm md:col-span-2" />
          <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 disabled:bg-slate-400 md:col-span-2">
            {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save topic changes" : "Publish topic"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">Published topics</h3>
          <span className="text-sm text-slate-500">{syllabusQuery.data?.length ?? 0} rows</span>
        </div>
        {syllabusQuery.isLoading ? <div className="p-8 text-center text-slate-500"><Loader className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading topics…</div> : syllabusQuery.data?.length ? (
          <div className="divide-y divide-slate-100">
            {syllabusQuery.data.map((topic: any) => (
              <div key={topic.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div><p className="font-semibold text-slate-900">{topic.subject} · {topic.topic}</p><p className="text-sm text-slate-500">{topic.unit} · {topic.class === "jeeMain" ? "JEE Main" : topic.class === "jeeAdvanced" ? "JEE Advanced" : `Class ${topic.class}`} · {topic.difficulty}</p></div>
                <div className="flex gap-2"><button type="button" onClick={() => startEdit(topic)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><Edit3 className="h-4 w-4" /> Edit</button><button type="button" onClick={() => deleteMutation.mutate({ id: topic.id })} disabled={deleteMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button></div>
              </div>
            ))}
          </div>
        ) : <p className="p-8 text-center text-sm text-slate-500">No topics published yet.</p>}
      </div>
    </div>
  );
}
