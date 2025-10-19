'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Globe, Calendar, Edit2, Camera, Settings, Mail, Briefcase, GraduationCap, Award, ExternalLink, Plus, X } from 'lucide-react';

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
  // Dashboard fields
  job_title?: string;
  company?: string;
  skills?: string[];
  work_experience?: Array<{
    title: string;
    company: string;
    start_date: string;
    end_date?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    start_date: string;
    end_date?: string;
    field?: string;
  }>;
  portfolio_items?: Array<{
    title: string;
    description?: string;
    url?: string;
    image?: string;
    category?: string;
  }>;
  achievements?: Array<{
    title: string;
    description?: string;
    date: string;
  }>;
  endorsements?: Array<{
    skill: string;
    count: number;
    endorsers?: Array<{name: string; id: number}>;
  }>;
  social_links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    behance?: string;
  };
  custom_widgets?: any;
  profile_views?: number;
  followers_count?: number;
  following_count?: number;
  status_message?: string;
  status_expiry?: string;
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
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'experience' | 'portfolio' | 'achievements'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

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

          {/* Job Title */}
          {profile.job_title && (
            <div className="mt-4">
              <p className="text-lg text-white font-semibold">{profile.job_title}</p>
              {profile.company && <p className="text-gray-400">{profile.company}</p>}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex gap-6 text-sm">
            <div>
              <span className="font-bold text-white">{posts.length}</span>
              <span className="text-gray-400 ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold text-white">{profile.followers_count || 0}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold text-white">{profile.following_count || 0}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold text-white">{profile.profile_views || 0}</span>
              <span className="text-gray-400 ml-1">Views</span>
            </div>
          </div>

          {/* Status Message */}
          {profile.status_message && (
            <div className="mt-4 bg-gray-700 rounded-lg p-3 text-sm">
              <p className="text-gray-300">{profile.status_message}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Connect</h3>
              <div className="flex gap-3">
                {profile.social_links.github && (
                  <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition">
                    GitHub
                  </a>
                )}
                {profile.social_links.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition">
                    LinkedIn
                  </a>
                )}
                {profile.social_links.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition">
                    Twitter
                  </a>
                )}
                {profile.social_links.behance && (
                  <a href={profile.social_links.behance} target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition">
                    Behance
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updateData: any = {};
              
              // Basic fields
              ['first_name', 'last_name', 'bio', 'location', 'website', 'job_title', 'company', 'status_message'].forEach(field => {
                const value = formData.get(field) as string;
                if (value) updateData[field] = value;
              });

              // Skills (comma-separated)
              const skillsValue = formData.get('skills') as string;
              if (skillsValue) {
                updateData.skills = skillsValue.split(',').map(s => s.trim()).filter(s => s);
              }

              // Social links
              const socialLinks: any = {};
              ['github', 'linkedin', 'twitter', 'behance'].forEach(platform => {
                const value = formData.get(platform) as string;
                if (value) socialLinks[platform] = value;
              });
              if (Object.keys(socialLinks).length > 0) {
                updateData.social_links = socialLinks;
              }

              try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/profile/me`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updateData),
                });

                if (response.ok) {
                  const updatedProfile = await response.json();
                  setProfile(updatedProfile);
                  setIsEditing(false);
                  alert('Profile updated successfully!');
                } else {
                  alert('Failed to update profile');
                }
              } catch (err) {
                alert('Error updating profile');
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    name="first_name"
                    type="text"
                    defaultValue={profile.first_name || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    name="last_name"
                    type="text"
                    defaultValue={profile.last_name || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={profile.bio || ''}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Tell us about yourself (max 160 characters)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    name="job_title"
                    type="text"
                    defaultValue={profile.job_title || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    name="company"
                    type="text"
                    defaultValue={profile.company || ''}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Tech Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills (comma-separated)</label>
                <input
                  name="skills"
                  type="text"
                  defaultValue={profile.skills?.join(', ') || ''}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Python, JavaScript, React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={profile.location || ''}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. New York, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  name="website"
                  type="url"
                  defaultValue={profile.website || ''}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status Message</label>
                <input
                  name="status_message"
                  type="text"
                  defaultValue={profile.status_message || ''}
                  maxLength={200}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="What's on your mind?"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                    <input
                      name="github"
                      type="url"
                      defaultValue={profile.social_links?.github || ''}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                    <input
                      name="linkedin"
                      type="url"
                      defaultValue={profile.social_links?.linkedin || ''}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                    <input
                      name="twitter"
                      type="url"
                      defaultValue={profile.social_links?.twitter || ''}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Behance</label>
                    <input
                      name="behance"
                      type="url"
                      defaultValue={profile.social_links?.behance || ''}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://behance.net/username"
                    />
                  </div>
                </div>
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
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === 'experience'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Experience
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === 'portfolio'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === 'achievements'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Achievements
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
            ) : activeTab === 'about' ? (
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
            ) : activeTab === 'experience' ? (
              <div className="space-y-4">
                {/* Work Experience */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <button 
                      onClick={() => setShowWorkModal(true)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {profile.work_experience && profile.work_experience.length > 0 ? (
                    <div className="space-y-4">
                      {profile.work_experience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-indigo-500 pl-4">
                          <h4 className="font-semibold text-white">{exp.title}</h4>
                          <p className="text-gray-400">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                          </p>
                          {exp.description && <p className="mt-2 text-gray-300 text-sm">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No work experience added yet</p>
                  )}
                </div>

                {/* Education */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <button 
                      onClick={() => setShowEducationModal(true)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {profile.education && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu, idx) => (
                        <div key={idx} className="border-l-2 border-indigo-500 pl-4">
                          <h4 className="font-semibold text-white">{edu.degree}</h4>
                          <p className="text-gray-400">{edu.school}</p>
                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                          <p className="text-sm text-gray-500">
                            {edu.start_date} - {edu.end_date || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No education history added yet</p>
                  )}
                </div>
              </div>
            ) : activeTab === 'portfolio' ? (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Portfolio</h3>
                  <button 
                    onClick={() => setShowPortfolioModal(true)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
                {profile.portfolio_items && profile.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.portfolio_items.map((item, idx) => (
                      <div key={idx} className="bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition">
                        {item.image && (
                          <div className="h-48 bg-gray-600">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                          {item.description && <p className="text-gray-400 text-sm mb-2">{item.description}</p>}
                          {item.category && (
                            <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" 
                               className="block mt-2 text-indigo-400 hover:text-indigo-300 text-sm">
                              View Project →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No portfolio items added yet</p>
                )}
              </div>
            ) : activeTab === 'achievements' ? (
              <div className="space-y-4">
                {/* Profile Analytics */}
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-700/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    Profile Insights
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{profile.profile_views || 0}</div>
                      <div className="text-sm text-gray-400 mt-1">Profile Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{posts.length}</div>
                      <div className="text-sm text-gray-400 mt-1">Total Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {(profile.work_experience?.length || 0) + (profile.education?.length || 0)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Experience Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{profile.portfolio_items?.length || 0}</div>
                      <div className="text-sm text-gray-400 mt-1">Portfolio Items</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Profile Completeness: <span className="text-white font-semibold">
                        {Math.round(
                          ((profile.first_name ? 1 : 0) +
                          (profile.last_name ? 1 : 0) +
                          (profile.bio ? 1 : 0) +
                          (profile.avatar ? 1 : 0) +
                          (profile.cover_photo ? 1 : 0) +
                          (profile.location ? 1 : 0) +
                          (profile.job_title ? 1 : 0) +
                          (profile.skills && profile.skills.length > 0 ? 1 : 0) +
                          (profile.work_experience && profile.work_experience.length > 0 ? 1 : 0) +
                          (profile.portfolio_items && profile.portfolio_items.length > 0 ? 1 : 0)) / 10 * 100
                        )}%
                      </span>
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            ((profile.first_name ? 1 : 0) +
                            (profile.last_name ? 1 : 0) +
                            (profile.bio ? 1 : 0) +
                            (profile.avatar ? 1 : 0) +
                            (profile.cover_photo ? 1 : 0) +
                            (profile.location ? 1 : 0) +
                            (profile.job_title ? 1 : 0) +
                            (profile.skills && profile.skills.length > 0 ? 1 : 0) +
                            (profile.work_experience && profile.work_experience.length > 0 ? 1 : 0) +
                            (profile.portfolio_items && profile.portfolio_items.length > 0 ? 1 : 0)) / 10 * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Achievements & Awards</h3>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm">+ Add</button>
                  </div>
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {profile.achievements.map((achievement, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-white">{achievement.title}</h4>
                              {achievement.description && <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>}
                            </div>
                            <span className="text-xs text-gray-500">{achievement.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No achievements added yet</p>
                  )}
                </div>

                {/* Endorsements */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Endorsements</h3>
                  {profile.endorsements && profile.endorsements.length > 0 ? (
                    <div className="space-y-3">
                      {profile.endorsements.map((endorsement, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                          <span className="text-white">{endorsement.skill}</span>
                          <span className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm">
                            {endorsement.count} {endorsement.count === 1 ? 'endorsement' : 'endorsements'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No endorsements yet</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Work Experience Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Work Experience</h3>
              <button onClick={() => setShowWorkModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newExp = {
                title: formData.get('title') as string,
                company: formData.get('company') as string,
                start_date: formData.get('start_date') as string,
                end_date: formData.get('current') === 'on' ? undefined : (formData.get('end_date') as string),
                current: formData.get('current') === 'on',
                description: formData.get('description') as string,
              };

              const currentExperience = profile.work_experience || [];
              const updatedExperience = [...currentExperience, newExp];

              try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/profile/me`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ work_experience: updatedExperience }),
                });

                if (response.ok) {
                  const updatedProfile = await response.json();
                  setProfile(updatedProfile);
                  setShowWorkModal(false);
                  alert('Work experience added successfully!');
                } else {
                  alert('Failed to add work experience');
                }
              } catch (err) {
                alert('Error adding work experience');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Title*</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company*</label>
                <input
                  name="company"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Tech Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date*</label>
                  <input
                    name="start_date"
                    type="month"
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    name="end_date"
                    type="month"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  name="current"
                  type="checkbox"
                  id="current"
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="current" className="ml-2 text-sm text-gray-300">I currently work here</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Describe your role and responsibilities..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Experience
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Education</h3>
              <button onClick={() => setShowEducationModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newEdu = {
                degree: formData.get('degree') as string,
                school: formData.get('school') as string,
                field: formData.get('field') as string,
                start_date: formData.get('start_date') as string,
                end_date: formData.get('end_date') as string,
              };

              const currentEducation = profile.education || [];
              const updatedEducation = [...currentEducation, newEdu];

              try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/profile/me`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ education: updatedEducation }),
                });

                if (response.ok) {
                  const updatedProfile = await response.json();
                  setProfile(updatedProfile);
                  setShowEducationModal(false);
                  alert('Education added successfully!');
                } else {
                  alert('Failed to add education');
                }
              } catch (err) {
                alert('Error adding education');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Degree*</label>
                <input
                  name="degree"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">School*</label>
                <input
                  name="school"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. University of Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                <input
                  name="field"
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date*</label>
                  <input
                    name="start_date"
                    type="month"
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    name="end_date"
                    type="month"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Education
                </button>
                <button
                  type="button"
                  onClick={() => setShowEducationModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Portfolio Item</h3>
              <button onClick={() => setShowPortfolioModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newItem = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                url: formData.get('url') as string,
                image: formData.get('image') as string,
                category: formData.get('category') as string,
              };

              const currentPortfolio = profile.portfolio_items || [];
              const updatedPortfolio = [...currentPortfolio, newItem];

              try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/profile/me`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ portfolio_items: updatedPortfolio }),
                });

                if (response.ok) {
                  const updatedProfile = await response.json();
                  setProfile(updatedProfile);
                  setShowPortfolioModal(false);
                  alert('Portfolio item added successfully!');
                } else {
                  alert('Failed to add portfolio item');
                }
              } catch (err) {
                alert('Error adding portfolio item');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title*</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. My Awesome Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Describe your project..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project URL</label>
                <input
                  name="url"
                  type="url"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://project-url.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  name="image"
                  type="url"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://image-url.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  name="category"
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Web Development"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
