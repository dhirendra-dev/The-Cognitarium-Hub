import { useState } from 'react';
import { Image as ImageIcon, Loader, Download, Trash2, Maximize2, X, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  subject: string;
  timestamp: string;
  notes: string;
}

const PRESET_PROMPTS = {
  physics: [
    { label: "Inclined Plane FBD", prompt: "A detailed Free Body Diagram of a mass block sliding down an inclined plane at 30 degrees. Show gravity vector pulling downwards, perpendicular normal force pointing up-right, kinetic friction force vector opposing the motion, and components of gravity (mg sin theta, mg cos theta) neatly drawn on a dark slate academic grid. High-contrast vector design with neon cyan labels." },
    { label: "Rotational Pure Rolling", prompt: "A textbook-style 2D illustration of a solid cylinder of radius R rolling without slipping on a horizontal rough surface with velocity V_cm and angular velocity omega. Highlight the instantaneous point of contact with zero velocity. Premium technical drawing style on a dark background." },
    { label: "SHM Spring-Mass system", prompt: "A schematic of a spring-mass oscillator on a frictionless horizontal table. Include spring displacement x from the equilibrium position, spring force vector F = -kx, and acceleration vector. Labeled academic style, dark theme." }
  ],
  chemistry: [
    { label: "sp3d Orbital Geometry", prompt: "A beautiful high-precision 3D orbital molecular schematic of phosphorus pentachloride (PCl5) demonstrating trigonal bipyramidal sp3d geometry. Highlight axial bonds of length 219 pm and equatorial bonds of length 202 pm with elegant dotted lines, contrasting colors on a dark premium academic slate canvas." },
    { label: "FCC Crystal Lattice", prompt: "Crystalline structure unit cell of a Face-Centered Cubic (FCC) lattice. Spherical atoms at each corner of the cube and one at the center of each face. Show lattice vectors and packing boundaries. Neon emerald accent lighting on dark background." },
    { label: "Benzene Pi Orbitals", prompt: "Benzene molecular model displaying overlapping carbon p-orbitals forming the continuous ring of localized pi electron clouds above and below the planar carbon ring. Precise physical chemistry illustration." }
  ],
  math: [
    { label: "Parabola Conic Intersection", prompt: "A clean geometry schematic demonstrating conic sections. A plane intersecting a double-napped cone parallel to its lateral side to generate a perfect parabola. Highly defined, vector-drawn with crisp mathematical grid, dark mode." },
    { label: "Ellipse Focal Property", prompt: "An analytical geometry textbook diagram of an ellipse showing foci F1 and F2, a point P on the curve, with lines PF1 and PF2 indicating that PF1 + PF2 is constant. Include major and minor axes, directrices. Dark elegant aesthetic." },
    { label: "Complex Argand Diagram", prompt: "Mathematical plot representing complex numbers on the Argand plane. Show a complex number z = x + iy = r(cos theta + i sin theta) with magnitude r and argument theta elegantly plotted, with real and imaginary axes. High contrast." }
  ]
};

export default function ImageGenerator() {
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'math'>('physics');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [imageNotes, setImageNotes] = useState('');

  const generateImageMutation = trpc.imageGeneration.generateImage.useMutation({
    onSuccess: (result) => {
      if (result.success && result.imageUrl) {
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          prompt: customPrompt,
          url: result.imageUrl,
          subject,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: imageNotes
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        setCustomPrompt('');
        setImageNotes('');
      }
    },
  });

  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await generateImageMutation.mutateAsync({ prompt });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">AI Visual Studio</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Concept Image Studio</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Generate high-precision technical visualizations and FBD diagrams for complex JEE concepts using Manus AI.</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6 lg:col-span-1 h-fit border border-border bg-card">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">Select Subject</p>
            <div className="grid grid-cols-3 gap-2">
              {(['physics', 'chemistry', 'math'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold capitalize transition-all ${subject === s ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Preset Concepts</p>
            <div className="space-y-2">
              {PRESET_PROMPTS[subject].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateImage(preset.prompt)}
                  disabled={loading}
                  className="w-full text-left rounded-xl border border-border/80 bg-background/50 p-3.5 text-xs font-bold text-foreground hover:bg-muted/50 transition-all flex items-center justify-between group"
                >
                  <span>{preset.label}</span>
                  <Sparkles className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Custom Prompt</p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the technical diagram..."
              className="w-full rounded-xl border border-border bg-background p-3.5 text-xs font-semibold text-foreground min-h-24 focus:outline-primary"
            />
            <Button
              onClick={() => handleGenerateImage(customPrompt)}
              disabled={loading || !customPrompt.trim()}
              className="w-full rounded-full font-bold h-11"
            >
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {loading ? "Generating Diagram..." : "Generate Diagram"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Generated Visualizations ({generatedImages.length})</h2>
          {generatedImages.length === 0 ? (
            <Card className="rounded-[2rem] p-16 text-center space-y-3 border border-dashed border-border bg-card">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <p className="text-base font-bold text-foreground">No visualizations generated yet</p>
              <p className="text-sm font-semibold text-muted-foreground max-w-sm mx-auto">Click a preset concept on the left or enter a custom prompt to create your first technical diagram.</p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {generatedImages.map((img) => (
                <Card key={img.id} className="elevated-card rounded-[1.75rem] overflow-hidden border border-border bg-card flex flex-col justify-between">
                  <div className="relative group aspect-video bg-muted">
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="icon" variant="secondary" onClick={() => setFullscreenImage(img)} className="rounded-full">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => {
                        const a = document.createElement('a');
                        a.href = img.url;
                        a.download = `concept-${img.id}.png`;
                        a.click();
                      }} className="rounded-full">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => setGeneratedImages(prev => prev.filter(i => i.id !== img.id))} className="rounded-full">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[0.65rem] font-black uppercase text-primary">{img.subject}</span>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">{img.prompt}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{img.timestamp}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-card rounded-[2rem] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Diagram Preview</h3>
              <Button size="icon" variant="ghost" onClick={() => setFullscreenImage(null)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-muted aspect-video">
              <img src={fullscreenImage.url} alt={fullscreenImage.prompt} className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">{fullscreenImage.prompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
