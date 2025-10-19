'use client';

import React, { useState, useMemo } from 'react';
import {
  User, Aperture, MessageSquare, Bell, Settings, Rss, Globe, Users,
  Briefcase, Heart, ThumbsUp, Share2, CornerDownLeft, Filter, Zap, Lock, Eye
} from 'lucide-react';
import { API_BASE_URL, CONTENT_API_URL } from '@/lib/api-config';

// --- MOCK DATA ---
const mockProfile = {
  id: 'user_12345',
  name: 'Alex Rivera',
  title: 'Lead Product Designer | UX/UI Specialist',
  bio: 'Passionate about creating robust, human-centered digital experiences. Focused on accessibility and performance in modern web applications. Currently building something revolutionary.',
  location: 'San Francisco, CA',
  connections: 1250,
  followers: 4320,
  profilePic: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=AR',
  coverPhoto: 'https://placehold.co/1200x250/374151/FFFFFF?text=Personalized+Dynamic+Cover+Banner',
  badges: ['Verified User', 'Top Contributor'],
  skills: ['React', 'Tailwind CSS', 'Figma', 'UX Research', 'Prototyping'],
};

const mockFeed = [
  { id: 1, type: 'post', content: 'Just finished sketching out the flow for the new Portfolio section! The drag-and-drop feature is looking slick.', media: null, timestamp: '2h ago', likes: 123, comments: 22 },
  { id: 2, type: 'milestone', content: 'Hit 4,000 followers this week! 🎉 Grateful for the amazing community support.', media: null, timestamp: '1d ago', likes: 450, comments: 55 },
  { id: 3, type: 'shared', content: 'Shared a fascinating article on the future of AI in design. A must-read!', media: { title: 'AI & The Design Renaissance', url: 'https://placehold.co/600x300/10B981/FFFFFF?text=Article+Thumbnail' }, timestamp: '3d ago', likes: 88, comments: 15 },
];

const mockNotifications = [
  { id: 1, type: 'like', text: 'Sarah M. liked your post: "Just finished sketching..."', read: false, time: '10m ago' },
  { id: 2, type: 'comment', text: 'David L. commented on your portfolio item.', read: false, time: '30m ago' },
  { id: 3, type: 'connection', text: 'Mark K. accepted your connection request.', read: true, time: '1h ago' },
  { id: 4, type: 'view', text: 'Your profile was viewed 15 times today!', read: true, time: '5h ago' },
];

// --- UTILITY COMPONENTS ---

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 text-sm rounded-lg transition duration-200
      ${isActive
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="hidden lg:inline">{label}</span>
  </button>
);

interface PostCardProps {
  post: {
    id: number;
    type: string;
    content: string;
    media: { title: string; url: string } | null;
    timestamp: string;
    likes: number;
    comments: number;
  };
}

const PostCard = ({ post }: PostCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
    <div className="flex items-start space-x-4">
      <img src={mockProfile.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{mockProfile.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</div>
      </div>
    </div>

    <p className="mt-4 text-gray-700 dark:text-gray-300">{post.content}</p>

    {post.media && (
      <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <img src={post.media.url} alt={post.media.title} className="w-full h-auto object-cover" />
        <div className="p-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
          {post.media.title}
        </div>
      </div>
    )}

    <div className="mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-700">
      <div className="flex space-x-4 text-gray-500 dark:text-gray-400">
        <button className="flex items-center text-sm hover:text-indigo-600 transition">
          <Heart className="w-5 h-5 mr-1" /> {post.likes}
        </button>
        <button className="flex items-center text-sm hover:text-indigo-600 transition">
          <CornerDownLeft className="w-5 h-5 mr-1" /> {post.comments}
        </button>
      </div>
      <button className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition">
        <Share2 className="w-4 h-4 mr-1" /> Share
      </button>
    </div>
  </div>
);

// --- CONTENT SECTIONS ---

interface ActivityFeedProps {
  posts: typeof mockFeed;
}

const ActivityFeedComponent = ({ posts }: ActivityFeedProps) => (
  <>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Status Update</h2>
      <textarea
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
        rows={3}
        placeholder="What's on your mind? Share text, images, or links..."
      />
      <div className="mt-3 flex justify-between items-center">
        <div className="flex space-x-3">
            <button className="text-indigo-600 hover:text-indigo-400 text-sm flex items-center">
                <Aperture className="w-4 h-4 mr-1"/> Media
            </button>
            <button className="text-indigo-600 hover:text-indigo-400 text-sm flex items-center">
                <Globe className="w-4 h-4 mr-1"/> Poll
            </button>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          Post
        </button>
      </div>
    </div>

    <h2 className="text-2xl font-bold mb-4 dark:text-white">Activity Feed</h2>
    <div className="flex space-x-4 mb-6">
        <button className="flex items-center text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            <Filter className="w-4 h-4 mr-1"/> All Activity
        </button>
        <button className="flex items-center text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Rss className="w-4 h-4 mr-1"/> Posts Only
        </button>
        <button className="flex items-center text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Zap className="w-4 h-4 mr-1"/> Milestones
        </button>
    </div>

    {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
  </>
);

interface ConnectionsListProps {
  connections: number;
  followers: number;
}

// Generate consistent mock data for connections
const mockFollowers = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Connection ${i + 1}`,
  mutuals: [9, 2, 23, 21, 44][i],
}));

const mockConnections = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Friend ${i + 1}`,
  role: 'Colleague',
}));

const ConnectionsList = ({ connections, followers }: ConnectionsListProps) => (
    <div className="grid md:grid-cols-2 gap-6">
        {/* Followers Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Followers ({followers})</h3>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Search, filter, or categorize your followers here.</p>
            <div className="space-y-3">
                {mockFollowers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                        <div className="flex items-center">
                            <img src={`https://placehold.co/40x40/FCA5A5/881D1D?text=C${follower.id}`} alt="Connection" className="w-10 h-10 rounded-full object-cover mr-3" />
                            <div>
                                <div className="font-medium dark:text-white">{follower.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Mutuals: {follower.mutuals}</div>
                            </div>
                        </div>
                        <button className="text-indigo-600 text-sm hover:text-indigo-500">View</button>
                    </div>
                ))}
            </div>
        </div>

        {/* Connections Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connections ({connections})</h3>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Your categorized professional and social network.</p>
            <div className="space-y-3">
                {mockConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                        <div className="flex items-center">
                            <img src={`https://placehold.co/40x40/93C5FD/1E3A8A?text=F${connection.id}`} alt="Connection" className="w-10 h-10 rounded-full object-cover mr-3" />
                            <div>
                                <div className="font-medium dark:text-white">{connection.name}</div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400">{connection.role}</div>
                            </div>
                        </div>
                        <button className="text-gray-400 text-sm hover:text-red-500">Remove</button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

interface PortfolioSectionProps {
  skills: string[];
}

// Generate consistent endorsement counts for skills
const skillEndorsements: Record<string, number> = {
  'React': 46,
  'Tailwind CSS': 12,
  'Figma': 35,
  'UX Research': 15,
  'Prototyping': 50,
};

const PortfolioSection = ({ skills }: PortfolioSectionProps) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Portfolio & Skills Showcase</h2>

        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Core Skills & Endorsements</h3>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full dark:bg-indigo-900 dark:text-indigo-300 flex items-center">
                        {skill}
                        <span className="ml-2 font-bold text-xs bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            {skillEndorsements[skill] || 1}
                        </span>
                    </span>
                ))}
            </div>
            <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium">Request Endorsement</button>
        </div>

        <h3 className="text-xl font-semibold mb-4 dark:text-white">Recent Projects (Carousel View Mock)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <img
                        src={`https://placehold.co/400x250/34D399/10B981?text=Project+${i+1}`}
                        alt={`Project ${i+1}`}
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                        <h4 className="font-semibold dark:text-white">Project Title {i+1}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A brief description of the project and its impact.</p>
                        <button className="mt-2 text-indigo-600 text-xs hover:text-indigo-500">View Details</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SettingsAndPrivacy = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Privacy and Visibility Controls</h2>

        <div className="space-y-6">
            <div className="border p-4 rounded-lg dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 dark:text-white">Bio/About Section Visibility</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Control who can see your personal description.</p>
                <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>Public (Everyone)</option>
                    <option>Connections Only</option>
                    <option>Private (Only Me)</option>
                </select>
            </div>

            <div className="border p-4 rounded-lg dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 dark:text-white">Activity Feed Privacy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Manage who can see your recent posts and activity.</p>
                <div className="flex items-center space-x-3 text-sm dark:text-white">
                    <input type="checkbox" id="post-visibility" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"/>
                    <label htmlFor="post-visibility">Allow connections to share my posts</label>
                </div>
                <div className="flex items-center space-x-3 text-sm mt-2 dark:text-white">
                    <input type="checkbox" id="comment-status" className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"/>
                    <label htmlFor="comment-status">Require approval for comments on my profile</label>
                </div>
            </div>

            <div className="border p-4 rounded-lg dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 dark:text-white">Theme & Layout</h3>
                <div className="flex space-x-4">
                    <button className="flex items-center text-sm px-3 py-1 rounded-full bg-gray-900 text-white">
                        <Aperture className="w-4 h-4 mr-1"/> Dark Mode
                    </button>
                    <button className="flex items-center text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        <Eye className="w-4 h-4 mr-1"/> High Contrast
                    </button>
                </div>
            </div>
        </div>
    </div>
);

interface NotificationsPanelProps {
  notifications: typeof mockNotifications;
  markAllRead: () => void;
}

const NotificationsPanel = ({ notifications, markAllRead }: NotificationsPanelProps) => {
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Notifications ({unreadCount} Unread)</h2>
                <button
                    onClick={markAllRead}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition"
                >
                    Mark All As Read
                </button>
            </div>

            <div className="flex space-x-4 mb-6">
                <button className="flex items-center text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    <Filter className="w-4 h-4 mr-1"/> All Types
                </button>
                <button className="flex items-center text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Heart className="w-4 h-4 mr-1"/> Likes
                </button>
                <button className="flex items-center text-sm px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Users className="w-4 h-4 mr-1"/> Connections
                </button>
            </div>

            <div className="space-y-3">
                {notifications.map((n: any) => (
                    <div
                        key={n.id}
                        className={`p-4 rounded-lg transition duration-200 flex justify-between items-start
                            ${n.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800'}
                        `}
                    >
                        <div className="flex items-start">
                            <Bell className={`w-5 h-5 mr-3 mt-1 ${n.read ? 'text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                            <p className={`text-sm ${n.read ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-white'}`}>
                                {n.text}
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.time}</span>
                            </p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-600 self-center shrink-0 ml-4" title="Unread"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  const menuItems = useMemo(() => ([
    { id: 'feed', label: 'Activity Feed', icon: Rss, count: mockFeed.length },
    { id: 'portfolio', label: 'Portfolio/Showcase', icon: Briefcase, count: 5 },
    { id: 'connections', label: 'Connections', icon: Users, count: mockProfile.connections },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter((n: any) => !n.read).length },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings, count: 0 },
  ]), [notifications]);

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ActivityFeedComponent posts={mockFeed} />;
      case 'portfolio':
        return <PortfolioSection skills={mockProfile.skills} />;
      case 'connections':
        return <ConnectionsList connections={mockProfile.connections} followers={mockProfile.followers} />;
      case 'notifications':
        return <NotificationsPanel notifications={notifications} markAllRead={markAllRead} />;
      case 'settings':
        return <SettingsAndPrivacy />;
      default:
        return <ActivityFeedComponent posts={mockFeed} />;
    }
  };

  // Profile Header Component
  const ProfileHeader = () => (
    <div className="relative mb-8 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Cover Photo/Banner */}
      <div className="h-40 sm:h-56 w-full bg-gray-300 dark:bg-gray-700 relative">
        <img src={mockProfile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        <button className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full text-sm hover:bg-opacity-70 transition">
          <Aperture className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 pt-0 sm:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-12">
          {/* Profile Picture */}
          <div className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg shrink-0">
            <img src={mockProfile.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
            <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full border-2 border-white dark:border-gray-800 hover:bg-indigo-700 transition">
              <User className="w-4 h-4" />
            </button>
          </div>

          <div className="sm:ml-6 mt-4 sm:mt-0 flex-grow">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{mockProfile.name}</h1>
            <p className="text-lg text-indigo-600 dark:text-indigo-400 mt-1">{mockProfile.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                <Globe className="w-4 h-4 mr-1.5"/> {mockProfile.location}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end space-y-2 shrink-0">
            <button className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow-md">
              <MessageSquare className="w-4 h-4 mr-2" /> Direct Message
            </button>
            <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span><span className="font-semibold">{mockProfile.connections}</span> Connections</span>
                <span><span className="font-semibold">{mockProfile.followers}</span> Followers</span>
            </div>
          </div>
        </div>

        {/* Bio/About Section */}
        <div className="mt-6 border-t pt-4 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">About Me</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {mockProfile.bio}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                {mockProfile.badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full dark:bg-teal-900 dark:text-teal-300 flex items-center">
                        <Lock className="w-3 h-3 mr-1"/> {badge}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans antialiased text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-black mb-6 text-center lg:text-left text-indigo-600 dark:text-indigo-400">Profile Dashboard</h1>

        {/* PROFILE HEADER (Cover Photo, Picture, Bio, Actions) */}
        <ProfileHeader />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION (Desktop) / TOP NAV (Mobile) */}
          <aside className={`lg:w-64 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-full' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg sticky top-6">
                <h3 className="font-bold text-gray-500 uppercase text-xs mb-4 hidden lg:block">Navigation</h3>
                <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0">
                    {menuItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeTab === item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                        />
                    ))}
                </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-grow min-w-0">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md text-indigo-600 dark:text-indigo-400 font-semibold flex justify-center items-center"
                >
                    <Settings className="w-5 h-5 mr-2"/> {isSidebarOpen ? 'Close Menu' : 'Open Navigation'}
                </button>
            </div>

            {/* Render Active Tab Content */}
            <div className="min-h-[60vh] transition-opacity duration-300">
                {renderContent()}
            </div>
          </main>
        </div>

        {/* Fixed Messaging Widget (Mock) */}
        <div className="fixed bottom-6 right-6 z-10">
            <button className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition duration-200">
                <MessageSquare className="w-6 h-6"/>
            </button>
        </div>

        {/* Simple Onboarding Tip (Mock) */}
        <div className="fixed bottom-24 right-6 p-3 bg-yellow-100 text-yellow-800 rounded-lg shadow-xl text-sm hidden sm:block">
            <p className="font-medium">💡 Quick Tip: Don&apos;t forget to update your Bio Section!</p>
        </div>

      </div>
    </div>
  );
}
