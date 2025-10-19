'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Briefcase, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    try {
      // Update user profile with onboarding data
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          bio,
          location,
          job_title: jobTitle,
        }),
      });

      if (response.ok) {
        // Redirect to dashboard
        router.push('/dashboard-new');
      } else {
        // If profile update fails, still redirect but show a message
        console.error('Failed to update profile');
        router.push('/dashboard-new');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Still redirect even if there's an error
      router.push('/dashboard-new');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen veridia-bg text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .veridia-bg {
          background: #0f172a;
          background-image: radial-gradient(at 0% 0%, #1e3a8a 0%, transparent 50%),
                            radial-gradient(at 100% 100%, #4c1d95 0%, transparent 50%);
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-white flex items-center">
            <Zap className="w-6 h-6 mr-2 text-indigo-400" />
            Veridia<span className="text-indigo-400">App</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">Step {step} of 3</div>
          </div>
        </div>
      </header>

      {/* Onboarding Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-800/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step > num ? <CheckCircle className="w-6 h-6" /> : num}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to VeridiaApp! 👋</h2>
                <p className="text-gray-400">Let's set up your profile to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h2>
                <p className="text-gray-400">This helps the community get to know you better</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Software Engineer"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Welcome */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">You're all set! 🎉</h2>
                <p className="text-gray-400">
                  Welcome to VeridiaApp. Let's start verifying content and fighting misinformation together!
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">What's next?</h3>
                <ul className="text-left space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Explore content submitted by the community</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Vote on content authenticity to help verify information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Submit your own content for verification</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && step < 3 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition duration-200"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className={`${step === 1 ? 'w-full' : 'ml-auto'} px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center`}
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Go to Dashboard'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
