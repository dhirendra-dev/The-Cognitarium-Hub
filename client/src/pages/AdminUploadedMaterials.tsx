import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Eye, Loader, AlertCircle, BookOpen } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Material {
  id: number;
  title: string;
  description: string;
  subject: string;
  chapter: string;
  fileUrl: string;
  fileKey: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  views: number;
  downloads: number;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History'];

export default function AdminUploadedMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - in production, fetch from API
  useEffect(() => {
    const mockMaterials: Material[] = [
      {
        id: 1,
        title: 'Rotational Dynamics - Complete Notes',
        description: 'Comprehensive notes covering rotational motion, torque, angular momentum, and rolling without slipping.',
        subject: 'Physics',
        chapter: 'Rotational Dynamics',
        fileUrl: '#',
        fileKey: 'physics-rotational-dynamics-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-15',
        fileSize: '2.4 MB',
        views: 342,
        downloads: 89
      },
      {
        id: 2,
        title: 'Chemical Bonding - Hybridization Guide',
        description: 'Detailed guide on hybridization states, molecular geometry, and bonding theories.',
        subject: 'Chemistry',
        chapter: 'Chemical Bonding',
        fileUrl: '#',
        fileKey: 'chemistry-bonding-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-14',
        fileSize: '1.8 MB',
        views: 256,
        downloads: 67
      },
      {
        id: 3,
        title: 'Conic Sections - Formulas & Problems',
        description: 'All formulas for ellipse, parabola, and hyperbola with solved examples.',
        subject: 'Mathematics',
        chapter: 'Conic Sections',
        fileUrl: '#',
        fileKey: 'math-conics-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-13',
        fileSize: '3.1 MB',
        views: 421,
        downloads: 134
      },
      {
        id: 4,
        title: 'Thermodynamics - First & Second Law',
        description: 'In-depth explanation of thermodynamic laws with practical applications.',
        subject: 'Physics',
        chapter: 'Thermodynamics',
        fileUrl: '#',
        fileKey: 'physics-thermo-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-12',
        fileSize: '2.7 MB',
        views: 198,
        downloads: 45
      },
      {
        id: 5,
        title: 'Organic Chemistry - GOC & Isomerism',
        description: 'General Organic Chemistry concepts and isomerism types with mechanisms.',
        subject: 'Chemistry',
        chapter: 'Organic Chemistry',
        fileUrl: '#',
        fileKey: 'chemistry-goc-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-11',
        fileSize: '4.2 MB',
        views: 567,
        downloads: 156
      },
      {
        id: 6,
        title: 'Permutations & Combinations - Master Guide',
        description: 'Complete guide covering fundamental counting principles and advanced problems.',
        subject: 'Mathematics',
        chapter: 'Permutations & Combinations',
        fileUrl: '#',
        fileKey: 'math-pc-001',
        uploadedBy: 'Admin',
        uploadedAt: '2024-05-10',
        fileSize: '2.9 MB',
        views: 389,
        downloads: 112
      }
    ];

    setMaterials(mockMaterials);
    setLoading(false);
  }, []);

  // Filter and sort materials
  useEffect(() => {
    let filtered = materials;

    // Filter by subject
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(m => m.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.chapter.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredMaterials(filtered);
  }, [materials, selectedSubject, searchQuery, sortBy]);

  const handleDownload = (material: Material) => {
    // In production, this would trigger actual download
    console.log('Downloading:', material.title);
    alert(`Downloading: ${material.title}`);
  };

  const handlePreview = (material: Material) => {
    // In production, this would open PDF viewer
    console.log('Previewing:', material.title);
    alert(`Opening preview for: ${material.title}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Admin Uploaded Materials</h1>
          </div>
          <p className="text-slate-600">Study materials curated and uploaded by administrators</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search materials by title, chapter, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Downloaded</option>
                <option value="views">Most Viewed</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">View</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredMaterials.length}</span> materials found
              </p>
            </div>
          </div>
        </div>

        {/* Materials Display */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No materials found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{material.title}</h3>
                      <p className="text-xs text-blue-100 mt-1">{material.chapter}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-slate-600 line-clamp-2">{material.description}</p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">{material.views}</p>
                      <p>Views</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{material.downloads}</p>
                      <p>Downloads</p>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <p>{material.fileSize} • Uploaded {material.uploadedAt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handlePreview(material)}
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{material.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{material.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{material.subject}</span>
                        <span>•</span>
                        <span>{material.chapter}</span>
                        <span>•</span>
                        <span>{material.fileSize}</span>
                        <span>•</span>
                        <span>{material.views} views</span>
                        <span>•</span>
                        <span>{material.downloads} downloads</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePreview(material)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(material)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{materials.length}</p>
            <p className="text-slate-600 mt-2">Total Materials</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{materials.reduce((sum, m) => sum + m.downloads, 0)}</p>
            <p className="text-slate-600 mt-2">Total Downloads</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{materials.reduce((sum, m) => sum + m.views, 0)}</p>
            <p className="text-slate-600 mt-2">Total Views</p>
          </div>
        </div>
      </div>
    </div>
  );
}
