import React, { useState } from 'react';
import { Send, Trash2, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type MessageType = 'notice' | 'announcement' | 'warning' | 'info';

interface AdminMessage {
  id: number;
  title: string;
  content: string;
  type: MessageType;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date | null;
  readCount?: number;
  recipientCount?: number;
}

export default function AdminMessaging() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notice' as MessageType,
    expiresAt: '',
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch all messages
  const { data: messages = [], isLoading, refetch } = trpc.messages.getAll.useQuery();

  // Send message mutation
  const sendMessageMutation = trpc.admin.sendMessage.useMutation({
    onSuccess: () => {
      setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
      refetch();
    },
    onError: (error) => {
      alert(`Error sending message: ${error.message}`);
    },
  });

  // Delete message mutation
  const deleteMessageMutation = trpc.admin.deleteMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Error deleting message: ${error.message}`);
    },
  });

  // Toggle message mutation
  const toggleMessageMutation = trpc.admin.toggleMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Error toggling message: ${error.message}`);
    },
  });

  // Update message mutation
  const updateMessageMutation = trpc.admin.updateMessage.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
      refetch();
    },
    onError: (error) => {
      alert(`Error updating message: ${error.message}`);
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
    };

    if (editingId) {
      updateMessageMutation.mutate({ id: editingId, ...payload });
    } else {
      sendMessageMutation.mutate(payload);
    }
  };

  const handleDeleteMessage = (id: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate({ id });
    }
  };

  const handleToggleMessage = (id: number) => {
    toggleMessageMutation.mutate({ id });
  };

  const handleEditMessage = (message: any) => {
    setEditingId(message.id);
    setFormData({
      title: message.title,
      content: message.content,
      type: message.type,
      expiresAt: message.expiresAt ? new Date(message.expiresAt).toISOString().split('T')[0] : '',
    });
  };

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'notice':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'announcement':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'info':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Messaging</h1>
          <p className="text-slate-600">Send notices and announcements to all members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingId ? 'Edit Message' : 'New Message'}
              </h2>

              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Message title"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Message content"
                    rows={5}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MessageType }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="notice">Notice</option>
                    <option value="announcement">Announcement</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expires At (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending || updateMessageMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {editingId ? 'Update' : 'Send'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-slate-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-slate-600">No messages sent yet</p>
                </div>
              ) : (
                messages.map((message: any) => (
                  <div key={message.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getTypeColor(message.type)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{message.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(message.type)}`}>
                            {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                          </span>
                          {!message.isActive && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{message.content}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Sent</p>
                        <p className="text-sm text-slate-900">{new Date(message.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Read</p>
                        <p className="text-sm font-bold text-blue-600">{message.readCount || 0} / {message.recipientCount || 0}</p>
                      </div>
                      {message.expiresAt && (
                        <div>
                          <p className="text-xs text-slate-600 font-semibold">Expires</p>
                          <p className="text-sm text-slate-900">{new Date(message.expiresAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleMessage(message.id)}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                          message.isActive
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {message.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
