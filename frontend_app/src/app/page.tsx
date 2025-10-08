import Layout from "@/components/Layout";
import Link from "next/link";
import { SparklesIcon, CheckCircleIcon, UserIcon, SearchIcon, TrendingUpIcon } from "@/components/icons";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden -mt-12 -mx-4 md:-mx-6 px-4 md:px-6 pt-24 pb-16 mb-16">
        {/* Animated Background Pattern */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: 'url(/patterns/grid-pattern.svg)',
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(10, 127, 255, 0.1) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6 animate-fadeIn border border-blue-200 dark:border-blue-800">
              <SparklesIcon size={16} />
              <span>Powered by AI & Community Verification</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn delay-100" style={{ letterSpacing: '-0.02em' }}>
              Empowering{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Truth-Seekers
              </span>
            </h1>
          
            <p className="text-lg md:text-2xl mb-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto animate-fadeIn delay-200" style={{ lineHeight: '1.6' }}>
              A dynamic, mobile-first platform for content verification
            </p>
            
            <p className="text-base md:text-lg mb-10 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fadeIn delay-300">
              Join a community-driven ecosystem where truth-seekers, researchers, 
              and content creators collaborate to verify and discover reliable information.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounceIn delay-400">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-lg shadow-lg btn-hover"
                style={{ 
                  backgroundColor: '#0A7FFF',
                  color: 'white',
                }}
              >
                Get Started Free →
              </Link>
              <Link
                href="/discovery"
                className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 font-semibold text-lg btn-hover"
                style={{ 
                  borderColor: '#0A7FFF',
                  color: '#0A7FFF',
                }}
              >
                Explore Content
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Feature Cards - F-Pattern Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <div 
            className="p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover-lift animate-slideInFromLeft delay-500"
            style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
          >
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/30"
            >
              <CheckCircleIcon size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Create & Verify
            </h3>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              Submit content for verification and leverage AI-assisted tools to ensure accuracy and reliability.
            </p>
          </div>

          <div 
            className="p-6 md:p-8 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover-lift animate-fadeIn delay-600"
            style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
          >
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-green-100 dark:bg-green-900/40"
            >
              <UserIcon size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Community Driven
            </h3>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              Vote on content authenticity, participate in discussions, and build reputation through meaningful contributions.
            </p>
          </div>

          <div 
            className="p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover-lift animate-slideInFromRight delay-700"
            style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
          >
            <div 
              className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/30"
            >
              <SearchIcon size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Smart Discovery
            </h3>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              Advanced search and AI-powered recommendations help you find verified, high-quality content instantly.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 p-8 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn delay-800">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUpIcon size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">10K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Content Verified</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UserIcon size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">5K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon size={24} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">95%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <SparklesIcon size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Assistance</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800 animate-fadeIn delay-900">
          <p className="text-sm uppercase tracking-wide font-semibold mb-6 text-gray-500 dark:text-gray-400">
            Trusted by Truth-Seekers Worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-2xl">🎓</span>
              <span className="font-medium">Researchers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-2xl">📰</span>
              <span className="font-medium">Journalists</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-2xl">🏫</span>
              <span className="font-medium">Educators</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-2xl">🌍</span>
              <span className="font-medium">Global Community</span>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
}
