import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

setLogLevel('debug');

// Global variables provided by the environment
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string | undefined;

// Define a type for a Post
interface Post {
  id: string;
  userId: string;
  content: string;
  timestamp: any;
}

const App = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to create a mock user ID if a real one isn't available
  const createMockUserId = () => {
    return `mock-user-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Helper function to format the timestamp into a relative time string (e.g., "5min ago")
  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) {
      return 'Just now';
    }
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + "yr" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + "mon" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + "d" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "hr" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "min" + (Math.floor(interval) === 1 ? "" : "s") + " ago";
    }
    return Math.floor(seconds) + "s ago";
  };


  useEffect(() => {
    // Initialize Firebase and authenticate
    const initializeFirebase = async () => {
      try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }

        const user = auth.currentUser;
        setUserId(user?.uid || createMockUserId());
        setIsAuthReady(true);

        // Set up real-time listener for posts
        const postsCollectionPath = `artifacts/${appId}/public/data/posts`;
        const postsQuery = query(collection(db, postsCollectionPath));

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const fetchedPosts: Post[] = [];
          snapshot.forEach(doc => {
            const postData = doc.data();
            fetchedPosts.push({
              id: doc.id,
              userId: postData.userId,
              content: postData.content,
              timestamp: postData.timestamp,
            });
          });
          
          // Sort by timestamp in descending order
          fetchedPosts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
          setPosts(fetchedPosts);
        }, (error) => {
          console.error("Error fetching posts: ", error);
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();

      } catch (error) {
        console.error("Firebase initialization or authentication failed:", error);
      }
    };

    initializeFirebase();
  }, []); // Empty dependency array means this effect runs once on mount

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !userId) {
      return; // Don't post empty content
    }
    
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const postsCollectionPath = `artifacts/${appId}/public/data/posts`;
      await addDoc(collection(db, postsCollectionPath), {
        userId: userId,
        content: postContent,
        timestamp: serverTimestamp(),
      });
      setPostContent(''); // Clear the input field
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      if (mobileMenuOpen && mobileMenuButton && !mobileMenuButton.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [mobileMenuOpen]);


  const renderPosts = () => {
    if (!isAuthReady) {
      return (
        <div className="text-center text-gray-500">
          <i className="fas fa-spinner fa-spin text-3xl"></i>
          <p className="mt-2">Loading posts...</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">No posts yet. Be the first to share!</div>
      );
    }

    return posts.map(post => (
      <div key={post.id} className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-lg mr-3">
            {post.userId.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 truncate">User: {post.userId}</h4>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(post.timestamp)}
            </p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
    ));
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* Tailwind CSS and Font Awesome CDN links are assumed to be loaded */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }
        
        body {
            background: linear-gradient(to bottom right, #f9fafb, #e5e7eb);
            color: #1f2937;
            min-height: 100vh;
        }
        
        .gradient-bg {
            background: linear-gradient(to bottom right, #f9fafb, #e5e7eb);
        }
        
        .nav-gradient {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
        }
        
        .hero-gradient {
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .card-gradient {
            background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
        }
        
        .stats-gradient {
            background: linear-gradient(to right, #4f46e5, #7c3aed);
        }
        
        .rotate-3d {
            animation: rotate3d 20s linear infinite;
        }
        
        .pulse-opacity {
            animation: pulseOpacity 3s ease-in-out infinite;
        }
        
        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes rotate3d {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }
        
        @keyframes pulseOpacity {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.3; }
        }
        
        .animate-pulse-slow {
            animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animation-delay-500 {
            animation-delay: 500ms;
        }
        
        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .join-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
        }
        
        .mobile-menu {
            transition: all 0.3s ease;
        }
        `}
      </style>
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 nav-gradient shadow-lg sticky top-0 z-50">
        <div className="flex items-center font-bold text-2xl text-indigo-600">
          <span className="text-4xl mr-2">🌟</span>
          <span>UGC Community</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-300">Home</a>
          <a href="#" className="font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-300">Explore</a>
          <a href="#" className="font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-300">Create</a>
          <a href="#community-feed" className="font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-300">Community</a>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-6 py-2 font-semibold shadow-lg join-btn transition-transform duration-300">
            Join Now
          </button>
        </div>
        {/* Mobile menu button */}
        <button className="md:hidden text-2xl" id="mobile-menu-button" onClick={toggleMobileMenu}>
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu md:hidden absolute top-16 left-0 w-full bg-white/90 backdrop-blur-lg z-40 shadow-md ${mobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="flex flex-col items-center py-4 space-y-4">
          <a href="#" className="font-medium text-lg text-gray-600 hover:text-indigo-600" onClick={closeMobileMenu}>Home</a>
          <a href="#" className="font-medium text-lg text-gray-600 hover:text-indigo-600" onClick={closeMobileMenu}>Explore</a>
          <a href="#" className="font-medium text-lg text-gray-600 hover:text-indigo-600" onClick={closeMobileMenu}>Create</a>
          <a href="#community-feed" className="font-medium text-lg text-gray-600 hover:text-indigo-600" onClick={closeMobileMenu}>Community</a>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-6 py-2 font-semibold shadow-lg">
            Join Now
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 py-16 lg:py-24 min-h-[90vh] overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse-slow"></div>
          <div className="absolute w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse-slow animation-delay-500"></div>
        </div>
        <div className="flex-1 max-w-2xl text-center lg:text-left mb-12 lg:mb-0 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold hero-gradient mb-6 leading-tight">
            Elevate Your Creations. Join the Platform.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with a global community of creators, access powerful tools, and share your work on a platform built for artists like you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-8 py-3 font-semibold text-lg shadow-xl join-btn transition-transform duration-300">
              Join the Platform
            </button>
            <button className="bg-white text-indigo-600 border-2 border-indigo-600 rounded-full px-8 py-3 font-semibold text-lg transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:scale-105">
              Explore Content
            </button>
          </div>
        </div>
        <div className="flex-1 relative flex justify-center items-center p-8 z-10">
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 float-animation">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full rotate-3d"></div>
            <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
              <div className="text-center p-6">
                <i className="fas fa-paint-brush text-6xl text-indigo-600 mb-4"></i>
                <p className="text-lg font-semibold text-gray-700">Create & Share</p>
                <p className="text-sm text-gray-500 mt-2">Join our community today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-12 text-gray-900">
          Why Choose Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card-gradient rounded-3xl p-8 text-center shadow-lg feature-card transition-transform duration-300">
            <div className="text-5xl mb-6 text-indigo-600">🚀</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">Easy to Use</h3>
            <p className="text-gray-600">Intuitive interface designed for creators of all experience levels.</p>
          </div>
          <div className="card-gradient rounded-3xl p-8 text-center shadow-lg feature-card transition-transform duration-300">
            <div className="text-5xl mb-6 text-indigo-600">🌐</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">Global Community</h3>
            <p className="text-gray-600">Connect with creators from around the world and grow your audience.</p>
          </div>
          <div className="card-gradient rounded-3xl p-8 text-center shadow-lg feature-card transition-transform duration-300">
            <div className="text-5xl mb-6 text-indigo-600">💡</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">Creative Tools</h3>
            <p className="text-gray-600">Powerful tools to enhance your content and streamline your workflow.</p>
          </div>
        </div>
      </section>

      {/* Community Feed Section */}
      <section id="community-feed" className="py-20 px-4 sm:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
            Community Feed
          </h2>
          <p className="text-center text-gray-600 mb-8">Share your thoughts and creations with the world. Your user ID is: <span id="user-id" className="font-bold text-indigo-600">{userId ? userId : 'Loading...'}</span></p>

          {/* Post Creation Form */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <textarea
                  id="post-content"
                  rows={4}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-6 py-2 font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
                  Post to Community
                </button>
              </div>
            </form>
          </div>

          {/* Posts Container */}
          <div id="posts-container" className="space-y-6">
            {renderPosts()}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-8 stats-gradient text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
          <div className="p-4">
            <div className="text-4xl sm:text-5xl font-bold mb-2">50K+</div>
            <div className="text-lg opacity-90">Active Users</div>
          </div>
          <div className="p-4">
            <div className="text-4xl sm:text-5xl font-bold mb-2">120K+</div>
            <div className="text-lg opacity-90">Content Pieces</div>
          </div>
          <div className="p-4">
            <div className="text-4xl sm:text-5xl font-bold mb-2">25+</div>
            <div className="text-lg opacity-90">Categories</div>
          </div>
          <div className="p-4">
            <div className="text-4xl sm:text-5xl font-bold mb-2">98%</div>
            <div className="text-lg opacity-90">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-8 bg-gray-50">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-12 text-gray-900">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mr-3">JD</div>
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-gray-500">Digital Artist</p>
              </div>
            </div>
            <p className="text-gray-600">"This platform has completely transformed how I share my work. The community is incredibly supportive!"</p>
            <div className="flex text-yellow-400 mt-4">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg mr-3">AS</div>
              <div>
                <h4 className="font-semibold">Anna Smith</h4>
                <p className="text-sm text-gray-500">Photographer</p>
              </div>
            </div>
            <p className="text-gray-600">"The tools available here are fantastic. I've grown my audience by 200% since joining last month."</p>
            <div className="flex text-yellow-400 mt-4">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg mr-3">MJ</div>
              <div>
                <h4 className="font-semibold">Mike Johnson</h4>
                <p className="text-sm text-gray-500">3D Designer</p>
              </div>
            </div>
            <p className="text-gray-600">"I've found so much inspiration from other creators on this platform. It's become my daily creative fuel."</p>
            <div className="flex text-yellow-400 mt-4">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 max-w-6xl mx-auto">
          <div className="flex items-center font-bold text-2xl mb-4 md:mb-0">
            <span className="text-4xl mr-2 text-indigo-400">🌟</span>
            <span>UGC Community</span>
          </div>
          <div className="flex flex-wrap justify-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms</a>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-700 text-gray-400">
          &copy; 2025 UGC Community Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
