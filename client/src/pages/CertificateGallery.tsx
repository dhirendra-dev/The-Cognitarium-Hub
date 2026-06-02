import React, { useState, useMemo } from 'react';
import { Search, Filter, Lock, Unlock } from 'lucide-react';
import { CERTIFICATES, CATEGORY_LABELS, CertificateCategory } from '@/data/certificates';

export default function CertificateGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CertificateCategory | 'all'>('all');
  const [hoveredCert, setHoveredCert] = useState<string | null>(null);

  const filteredCertificates = useMemo(() => {
    return CERTIFICATES.filter(cert => {
      const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cert.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories: (CertificateCategory | 'all')[] = ['all', 'achievement', 'subject', 'exam', 'community', 'milestone'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Certificate Gallery</h1>
          <p className="text-slate-600">Explore all 50 certificates you can earn at Cognitrium Hub</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {category === 'all' ? 'All Certificates' : CATEGORY_LABELS[category as CertificateCategory].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredCertificates.length}</span> of <span className="font-semibold text-slate-900">{CERTIFICATES.length}</span> certificates
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              onMouseEnter={() => setHoveredCert(cert.id)}
              onMouseLeave={() => setHoveredCert(null)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Card Header */}
              <div
                className="p-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${cert.color}20 0%, ${cert.color}10 100%)`
                }}
              >
                <div className="text-5xl mb-3">{cert.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg">{cert.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{cert.title}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-2">{cert.description}</p>

                {/* Tier Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cert.tier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                    cert.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                    cert.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {cert.tier.charAt(0).toUpperCase() + cert.tier.slice(1)}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{cert.xpReward} XP</span>
                </div>

                {/* How to Earn */}
                <div className={`p-3 rounded-lg bg-slate-50 border border-slate-200 transition-all ${
                  hoveredCert === cert.id ? 'block' : 'hidden'
                }`}>
                  <p className="text-xs font-semibold text-slate-700 mb-1">How to Earn:</p>
                  <p className="text-xs text-slate-600">{cert.condition}</p>
                </div>

                {/* Lock/Unlock Status */}
                <div className="flex items-center justify-center pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No certificates found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
