'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Globe, Calendar, Edit2, Camera, Settings, Mail } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';
const CONTENT_API_BASE_URL = 'http://localhost:8001/api/v1';

// TypeScript Interfaces
interface IProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  cover_photo?: string;
  location?: string;
  website?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface IPost {
  id: string;
  author_id: string;
  content_url?: string;
  content_text?: string;
  media_attachment?: string;
  status: string;
  tags: string[];
  submission_date: string;
}

// Profile Page Component
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isEditing, setIsEditing] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile
        const profileResponse = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch user posts
        const postsResponse = await fetch(`${CONTENT_API_BASE_URL}/content/user/${profileData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error || 'Profile not found'}</div>
      </div>
    );
  }

  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.first_name || profile.last_name || 'Anonymous User';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => router.push('/dashboard-new')}
            className="text-2xl font-extrabold text-white flex items-center cursor-pointer group"
          >
            <span>Veridia</span><span className="text-indigo-400">App</span>
          </div>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/settings')}
              className="text-indigo-300 hover:text-white transition duration-200 text-sm flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-t-2xl overflow-hidden">
          {profile.cover_photo && (
            <img src={profile.cover_photo} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button className="absolute bottom-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full transition">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-gray-800 rounded-b-2xl p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-800 overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white">{fullName}</h1>
                <p className="text-gray-400 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-1" />
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full flex items-center transition"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Bio and Details */}
          <div className="mt-6 space-y-3">
            {profile.bio && (
              <p className="text-gray-300">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {profile.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-indigo-400 transition"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {profile.website}
                </a>
              )}
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6 text-sm">
            <div>
              <span className="font-bold text-white">{posts.length}</span>
              <span className="text-gray-400 ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold text-white">0</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold text-white">0</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue={profile.first_name || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue={profile.last_name || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  defaultValue={profile.bio || ''}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Tell us about yourself (max 160 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={profile.location || ''}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  defaultValue={profile.website || ''}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'posts'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'about'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'posts' ? (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p>No posts yet</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-gray-800 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            {profile.avatar ? (
                              <img src={profile.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{fullName}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(post.submission_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.status === 'verified' ? 'bg-green-900 text-green-300' :
                          post.status === 'disputed' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      
                      {post.content_text && (
                        <p className="text-gray-300 mb-3">{post.content_text}</p>
                      )}
                      
                      {post.content_url && (
                        <a
                          href={post.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                          {post.content_url}
                        </a>
                      )}
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-3 text-gray-300">
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                  <p><strong>Account Status:</strong> {profile.is_active ? 'Active' : 'Inactive'}</p>
                  <p><strong>Member Since:</strong> {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
