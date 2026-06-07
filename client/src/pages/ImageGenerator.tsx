import React, { useState } from 'react';
import { Image as ImageIcon, Loader, Download, Trash2, Maximize2, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';

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
        console.log('Image generated successfully');
      } else {
        console.error('Failed to generate image:', result.error);
      }
    },
    onError: (error) => {
      console.error('Error:', error.message);
    },
  });

  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim()) {
      console.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      await generateImageMutation.mutateAsync({ prompt });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDownloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `concept-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Image Generator</h1>
          </div>
          <p className="text-blue-100">Generate technical visualizations for complex concepts using Manus AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 sticky top-6 shadow-sm">
              {/* Subject Selection */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Subject</label>
                <div className="space-y-2">
                  {(['physics', 'chemistry', 'math'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all ${
                        subject === s
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Prompts */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Preset Concepts</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {PRESET_PROMPTS[subject].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGenerateImage(preset.prompt)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Custom Prompt</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the concept visualization you want..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none h-24"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={() => handleGenerateImage(customPrompt)}
                disabled={loading || !customPrompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Gallery */}
          <div className="lg:col-span-2">
            {generatedImages.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No images generated yet</p>
                <p className="text-gray-500 text-sm mt-2">Select a preset or enter a custom prompt to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Image */}
                    <div className="relative bg-gray-100 aspect-video flex items-center justify-center group">
                      <img src={image.url} alt={image.prompt} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFullscreenImage(image)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Prompt</p>
                        <p className="text-gray-900 text-sm line-clamp-2">{image.prompt}</p>
                      </div>

                      {image.notes && (
                        <div>
                          <p className="text-gray-500 text-sm">Notes</p>
                          <p className="text-gray-700 text-sm">{image.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <p className="text-gray-500 text-xs">{image.timestamp}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownloadImage(image)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={fullscreenImage.url} alt={fullscreenImage.prompt} className="max-w-4xl max-h-[90vh] object-contain" />
        </div>
      )}
    </DashboardLayout>
  );
}
