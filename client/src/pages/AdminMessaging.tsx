import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader, Trash2, Edit2, Eye, EyeOff, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

type MessageType = 'notice' | 'announcement' | 'warning' | 'info';

interface AdminMessage {
  id: number;
  title: string;
  content: string;
  type: MessageType;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  recipientCount: number;
  readCount: number;
}

interface FormData {
  title: string;
  content: string;
  type: MessageType;
  expiresAt: string;
}

export default function AdminMessaging() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    type: 'notice',
    expiresAt: ''
  });

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real tRPC query
      // const result = await trpc.admin.getMessages.useQuery();
      // setMessages(result);
      setMessages([]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with real tRPC mutation
      if (editingId) {
        // await trpc.admin.updateMessage.useMutation({ id: editingId, ...formData });
        toast.success('Message updated successfully');
      } else {
        // await trpc.admin.createMessage.useMutation(formData);
        toast.success('Message sent to all members');
      }

      // Reset form
      setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
      setEditingId(null);
      setShowForm(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      // TODO: Replace with real tRPC mutation
      // await trpc.admin.deleteMessage.useMutation({ id });
      toast.success('Message deleted');
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      // TODO: Replace with real tRPC mutation
      // await trpc.admin.toggleMessage.useMutation({ id, isActive: !isActive });
      toast.success(isActive ? 'Message deactivated' : 'Message activated');
      loadMessages();
    } catch (error) {
      console.error('Error toggling message:', error);
      toast.error('Failed to update message');
    }
  };

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'notice':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'announcement':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'info':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'notice':
        return '📋';
      case 'announcement':
        return '📢';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-slate-900">Admin Messaging</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              New Message
            </button>
          </div>
          <p className="text-slate-600">Send notices and announcements to all members</p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {editingId ? 'Edit Message' : 'Create New Message'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Important Update, Exam Schedule"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your message here..."
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MessageType }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="notice">📋 Notice</option>
                  <option value="announcement">📢 Announcement</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="info">ℹ️ Information</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {editingId ? 'Update Message' : 'Send to All Members'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', content: '', type: 'notice', expiresAt: '' });
                  }}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages List */}
        {loading && !showForm ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No messages yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first message to notify all members</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(message.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900">{message.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(message.type)}`}>
                            {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                          </span>
                          {message.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-slate-600 text-sm mt-3 line-clamp-2">{message.content}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{message.recipientCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{message.readCount} read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                      </div>
                      {message.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {new Date(message.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(message.id, message.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        message.isActive
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                      title={message.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {message.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(message.id);
                        setFormData({
                          title: message.title,
                          content: message.content,
                          type: message.type,
                          expiresAt: message.expiresAt || ''
                        });
                        setShowForm(true);
                      }}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
