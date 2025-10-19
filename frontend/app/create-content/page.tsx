'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X, Upload, FileText, LinkIcon, Tag, ArrowLeft, Home, User, Search } from 'lucide-react';

const CONTENT_API_BASE_URL = 'http://localhost:8001/api/v1';

type Message = {
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function CreateContentPage() {
  const router = useRouter();
  const [contentUrl, setContentUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['.txt', '.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  const MAX_TEXT_LENGTH = 10000;
  const MAX_TAGS = 20;

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setMessage({ type: 'error', text: 'File size exceeds 10MB limit.' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // Validate file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
        setMessage({ type: 'error', text: `File type not allowed. Supported types: ${ALLOWED_FILE_TYPES.join(', ')}` });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setMediaFile(file);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Validate that at least one content field is provided
      if (!contentUrl && !contentText) {
        throw new Error('Please provide either a URL or text content to submit.');
      }

      // Validate text length
      if (contentText && contentText.length > MAX_TEXT_LENGTH) {
        throw new Error(`Content text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`);
      }

      // Validate tags count
      if (tags) {
        const tagList = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (tagList.length > MAX_TAGS) {
          throw new Error(`Maximum ${MAX_TAGS} tags allowed.`);
        }
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      if (contentUrl) formData.append('content_url', contentUrl);
      if (contentText) formData.append('content_text', contentText);
      if (tags) formData.append('tags', tags);
      if (mediaFile) formData.append('media_file', mediaFile);

      // Submit to content service
      const response = await fetch(`${CONTENT_API_BASE_URL}/content/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Content submitted successfully! Redirecting to verification page...' });
        // Clear form
        setContentUrl('');
        setContentText('');
        setTags('');
        setMediaFile(null);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Redirect to content detail page for verification
        const contentId = data._id || data.id;
        if (contentId) {
          setTimeout(() => {
            router.push(`/content/${contentId}`);
          }, 1000);
        }
      } else {
        throw new Error(data.detail || 'Failed to submit content.');
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setContentUrl('');
    setContentText('');
    setTags('');
    setMediaFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard-new')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/dashboard-new')}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              >
                VeridiaApp
              </button>
              <span className="text-gray-500">|</span>
              <h1 className="text-xl font-semibold text-gray-800">Create Post</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button onClick={() => router.push('/dashboard-new')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </button>
              <button onClick={() => router.push('/search')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </button>
              <button onClick={() => router.push('/profile')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`p-4 mb-6 rounded-xl border-l-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border-green-400' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border-red-400' :
            'bg-blue-100 text-blue-800 border-blue-400'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Send className="w-6 h-6 mr-3 text-indigo-400" />
              Submit Content for Verification
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content URL Input */}
            <div>
              <label htmlFor="content-url" className="block text-sm font-medium text-gray-700 mb-2">
                Content URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="content-url"
                  type="url"
                  placeholder="https://example.com/article-to-verify"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Provide the URL of content you want verified</p>
            </div>

            {/* Content Text Input */}
            <div>
              <label htmlFor="content-text" className="block text-sm font-medium text-gray-700 mb-2">
                Content Text
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-indigo-400" />
                <textarea
                  id="content-text"
                  placeholder="Paste the text content you want to verify..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={6}
                  maxLength={MAX_TEXT_LENGTH}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200 resize-y"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Or paste the text content directly ({contentText.length}/{MAX_TEXT_LENGTH} characters)
              </p>
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="tags"
                  type="text"
                  placeholder="news, technology, health (comma-separated, max 20)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Add relevant tags to categorize your submission</p>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="media-file-input" className="block text-sm font-medium text-gray-700 mb-2">
                Media Attachment (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="media-file-input"
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-900 border border-dashed border-gray-300 hover:border-indigo-500 rounded-xl cursor-pointer transition duration-200"
                >
                  <Upload className="w-5 h-5 mr-2 text-indigo-400" />
                  <span className="text-sm">
                    {mediaFile ? mediaFile.name : 'Choose file or drag here'}
                  </span>
                </label>
                {mediaFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="media-file-input"
                type="file"
                onChange={handleFileChange}
                accept=".txt,.jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: Images (.jpg, .png, .gif), Documents (.pdf, .txt) - Max 10MB
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit for Verification
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Your submission will be reviewed by the community and AI systems. 
              Make sure to provide accurate information to help maintain the integrity of the verification process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
