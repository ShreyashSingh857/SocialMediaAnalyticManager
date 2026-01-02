import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileData {
  name: string;
  age: string;
  instagram: string;
  country: string;
  location: string;
  description: string;
  contentType: string;
  consent: boolean;
  profilePhoto: File | null;
}

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    age: '',
    instagram: '',
    country: '',
    location: '',
    description: '',
    contentType: 'Lifestyle',
    consent: false,
    profilePhoto: null
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const totalSteps = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (4MB = 4 * 1024 * 1024 bytes)
      if (file.size > 4 * 1024 * 1024) {
        alert("File size must be less than 4MB.");
        e.target.value = ''; // Reset input
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }));

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.age !== '';
      case 2:
        return true; // Visuals are optional
      case 3:
        return formData.country.trim() !== '' && formData.location.trim() !== '';
      case 4:
        return formData.instagram.trim() !== '' && formData.description.trim() !== '';
      case 5:
        return formData.consent;
      default:
        return true;
    }
  };

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("Please provide consent to proceed.");
      return;
    }

    if (!user) {
      alert("No user found. Please log in.");
      return;
    }

    try {
      let profileUrl = null;

      if (formData.profilePhoto) {
        const file = formData.profilePhoto;
        const fileExt = file.name.split('.').pop();
        const fileName = `profile_photo.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        profileUrl = publicUrl;
      }

      const updates = {
        id: user.id,
        full_name: formData.name,
        age: parseInt(formData.age),
        instagram: formData.instagram,
        country: formData.country,
        location: formData.location,
        description: formData.description,
        content_type: formData.contentType,
        profile_photo_url: profileUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      alert("Profile saved successfully!");
      window.location.href = '/'; // Force reload/navigate to dashboard to ensure context updates
    } catch (error: any) {
      console.error("Error saving profile:", error);
      // Check for specific storage or RLS errors
      if (error.message?.includes('bucket')) {
        alert("Error: Storage bucket not found. Please ensure you've created the 'avatars' bucket in Supabase.");
      } else if (error.code === '42501') {
        alert("Error: Permission denied. Please check your database RLS policies.");
      } else {
        alert(`Error saving profile: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Calculate progress percentage
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-deep-bg text-white relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl relative z-10 animate-fade-in-up">

        {/* Progress System */}
        <div className="mb-8">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
            {['Identity', 'Visuals', 'Region', 'Content', 'Consent'].map((label, idx) => (
              <span key={label} className={`${currentStep >= idx + 1 ? 'text-white' : ''} transition-colors duration-300`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            Setup Profile
          </h2>
          <p className="text-gray-400">
            {currentStep === 1 && "Start with the basics."}
            {currentStep === 2 && "Add your personal touch."}
            {currentStep === 3 && "Where are you located?"}
            {currentStep === 4 && "Tell us about your work."}
            {currentStep === 5 && "Final legal check."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-medium text-gray-300">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  min="13"
                />
              </div>
            </div>
          )}

          {/* STEP 2: VISUALS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all group relative">

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  id="file-upload"
                />

                {previewUrl ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 mb-4 shadow-lg shadow-purple-500/20">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <label htmlFor="file-upload" className="text-lg font-medium text-white mb-1">
                  {previewUrl ? 'Change Photo' : 'Upload Profile Photo'}
                </label>
                <p className="text-sm text-gray-500">Max 4MB (Optional)</p>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-300">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">City / Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* STEP 4: CONTENT */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-300">Instagram Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">@</span>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="username"
                    value={formData.instagram}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-300">Type of Content</label>
                <select
                  id="contentType"
                  name="contentType"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-gray-900"
                  value={formData.contentType}
                  onChange={handleChange}
                >
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Tech">Tech</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Content Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                  placeholder="Briefly describe what your content is about..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 5: CONSENT */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    className="mt-1 w-5 h-5 rounded bg-black/20 border-white/30 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    checked={formData.consent}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="consent" className="text-sm text-gray-300 leading-relaxed">
                    I consent to the collection and processing of my details for this application and understand that the YouTube API will be used to fetch and store my public channel statistics (Subscribers, Views, Video Count). <br /><br />
                    <span className="text-gray-500 text-xs">This data is only used for your dashboard analytics and is not shared with third parties.</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
            {currentStep > 1 ? (
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                onClick={prevStep}
              >
                Back
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                type="button"
                className="px-8 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.consent}
              >
                Complete Setup
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
