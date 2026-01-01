import { useState } from 'react';
import './ProfileSetup.css';

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
  avatar: File | null;
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
    profilePhoto: null,
    avatar: null
  });

  const [previewUrls, setPreviewUrls] = useState<{ profile: string | null, avatar: string | null }>({
    profile: null,
    avatar: null
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePhoto' | 'avatar') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [type === 'profilePhoto' ? 'profile' : 'avatar']: url
      }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("Please provide consent to proceed.");
      return;
    }
    console.log("Profile Data Submitted:", formData);
    alert("Profile saved successfully! (Check console for data)");
    // Here we will eventually call the API
  };

  // Calculate progress percentage
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Progress System */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="step-indicator">
          <span className={currentStep >= 1 ? 'active' : ''}>Identity</span>
          <span className={currentStep >= 2 ? 'active' : ''}>Visuals</span>
          <span className={currentStep >= 3 ? 'active' : ''}>Region</span>
          <span className={currentStep >= 4 ? 'active' : ''}>Content</span>
          <span className={currentStep >= 5 ? 'active' : ''}>Consent</span>
        </div>

        <div className="profile-header">
          <h2>Setup Profile</h2>
          <p>
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
            <div className="step-content">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-input"
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
            <div className="step-content fade-in">
              <div className="file-upload-group">

                {/* Profile Photo Upload */}
                <div className="upload-zone">
                  <div className="upload-label">
                    <span>Profile Photo</span>
                    <small>Upload a clear headshot (JPG, PNG)</small>
                  </div>
                  {previewUrls.profile && (
                    <img src={previewUrls.profile} alt="Profile Preview" className="image-preview" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                  />
                </div>

                {/* Avatar Upload */}
                <div className="upload-zone">
                  <div className="upload-label">
                    <span>Avatar / Logo</span>
                    <small>Brand icon or stylized avatar</small>
                  </div>
                  {previewUrls.avatar && (
                    <img src={previewUrls.avatar} alt="Avatar Preview" className="image-preview preview-avatar" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="form-input"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">City / Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  placeholder="e.g. New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* STEP 4: CONTENT */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="form-group">
                <label htmlFor="instagram">Instagram Username</label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  className="form-input"
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="contentType">Type of Content</label>
                <select
                  id="contentType"
                  name="contentType"
                  className="form-select"
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
              <div className="form-group">
                <label htmlFor="description">Content Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Briefly describe what your content is about..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 5: CONSENT */}
          {currentStep === 5 && (
            <div className="step-content">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="consent">
                  I consent to the collection and processing of my details for this application and understand that a third-party API will be used to fetch analytic data.
                </label>
              </div>
            </div>
          )}

          <div className="button-group">
            {currentStep > 1 && (
              <button type="button" className="nav-btn back" onClick={prevStep}>
                Back
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                className="nav-btn next"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="nav-btn submit"
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
