import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import PhotoUpload from '../components/report/PhotoUpload';
import AIClassifyResult from '../components/report/AIClassifyResult';
import CategorySelector from '../components/report/CategorySelector';
import LocationPicker from '../components/report/LocationPicker';
import { analyzeImageWithVision } from '@shared/visionApi.js';
import { classifyFromVisionResponse } from '@shared/classifyIssue.js';
import { createIssue, generateTrackingId, awardCivicPoints } from '@shared/firestore.js';
import { uploadIssuePhoto } from '@shared/storage.js';
import { updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [classification, setClassification] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(3);
  const [category, setCategory] = useState('other');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  const { user, userProfile } = useAuth();
  const { location, address, requestPermission } = useGeolocation();
  const navigate = useNavigate();

  const handleStep3 = async () => {
    await requestPermission();
    if (location) {
      setPickedLocation(location);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPickedLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
    setStep(3);
  };

  const handlePhotoChange = async (newPhotos) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0) {
      setAnalyzing(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target.result.split(',')[1];
          const visionResponse = await analyzeImageWithVision(base64);
          const result = classifyFromVisionResponse(visionResponse);
          setClassification(result);
          setCategory(result.category);
          setSeverity(result.severity);
          setTitle(result.suggestedTitle);
          setAnalyzing(false);
        };
        reader.readAsDataURL(newPhotos[0]);
      } catch (e) {
        setAnalyzing(false);
        toast.error('AI classification failed, please select manually');
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    setSubmitting(true);
    try {
      const mediaUrls = await Promise.all(
        photos.map((photo, idx) => uploadIssuePhoto(user.uid, photo, idx))
      );
      const trackingId = generateTrackingId(userProfile?.city || 'AHM');
      const issueData = {
        reportedBy: user.uid,
        reporterName: user.displayName || 'User',
        reporterPhoto: user.photoURL || '',
        title: title || 'Issue reported',
        description: description.slice(0, 500),
        category, severity,
        status: 'open',
        department: classification?.department || 'other',
        location: pickedLocation ? { latitude: pickedLocation.lat, longitude: pickedLocation.lng } : null,
        address: address || '',
        ward: userProfile?.ward || '',
        city: userProfile?.city || '',
        mediaUrls,
        thumbnailUrl: mediaUrls[0] || '',
        aiClassification: classification ? { labels: classification.labels, confidence: classification.confidence, rawResponse: {} } : null,
        upvotes: 0, upvotedBy: [], verifiedBy: [], isVerified: false,
        duplicateOf: null, assignedDept: '', assignedAt: null,
        resolvedAt: null, resolvedBy: null, resolutionNote: null,
        resolutionPhotoUrl: null, rejectionReason: null, geohash: '', trackingId
      };
      const issueId = await createIssue(issueData);
      await updateDoc(doc(db, 'users', user.uid), { totalReports: increment(1) });
      await awardCivicPoints(user.uid, 'report_accepted');
      toast.success(`Report submitted! Tracking ID: ${trackingId}`);
      navigate(`/issues/${issueId}`);
    } catch (e) {
      console.error('Submit failed:', e);
      toast.error('Failed to submit report');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="material-symbols-outlined text-white/60 hover:text-white transition-colors active:scale-95">
              arrow_back
            </button>
            <h1 className="text-xl font-bold text-white/90">Report Issue</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">Step {step}/3</span>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white/90">Take a Photo</h2>
                  <p className="text-sm text-white/60">Our AI will automatically classify the issue from your photo.</p>
                </div>

                <PhotoUpload photos={photos} onPhotosChange={handlePhotoChange} />

                {analyzing && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
                    <Loader2 size={20} className="text-blue-300 animate-spin" />
                    <span className="text-sm font-medium text-blue-300">AI is analyzing your photo...</span>
                  </div>
                )}

                <div className="flex justify-between items-center px-1">
                  <span className="text-sm text-white/50">{photos.length}/1 photo</span>
                  <div className={`w-2 h-2 rounded-full ${photos.length >= 1 ? 'bg-blue-400' : 'bg-white/20'}`} />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={photos.length === 0 || analyzing}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}
                >
                  Next
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Tips grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-2xl w-full">
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-5 rounded-xl flex flex-col gap-2">
                <span className="material-symbols-outlined text-cyan-300">lightbulb</span>
                <h3 className="text-sm font-semibold text-white/90">Good Lighting</h3>
                <p className="text-xs text-white/60">Take photos during daylight for faster AI verification.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-5 rounded-xl flex flex-col gap-2">
                <span className="material-symbols-outlined text-cyan-300">straighten</span>
                <h3 className="text-sm font-semibold text-white/90">Multiple Angles</h3>
                <p className="text-xs text-white/60">Show both a close-up and a wide shot for context.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-5 rounded-xl flex flex-col gap-2">
                <span className="material-symbols-outlined text-cyan-300">location_on</span>
                <h3 className="text-sm font-semibold text-white/90">Auto-Location</h3>
                <p className="text-xs text-white/60">We'll use GPS metadata to pinpoint the report instantly.</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white/90 mb-4">Details</h2>
              {classification && <AIClassifyResult classification={classification} onChangeCategory={() => setShowCategorySelector(!showCategorySelector)} />}
              {showCategorySelector && <CategorySelector selected={category} onSelect={(c) => { setCategory(c); setShowCategorySelector(false); }} />}
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white placeholder:text-white/40" placeholder="Issue title" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Description <span className="text-white/40">(optional)</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none transition-all text-white placeholder:text-white/40" placeholder="Describe the issue" />
                  <p className="text-xs text-white/40 mt-1.5">{description.length}/500</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Severity: {severity}</label>
                  <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full accent-cyan-400" />
                  <div className="flex justify-between text-xs text-white/40 mt-1.5"><span>Low</span><span>Critical</span></div>
                </div>
              </div>
            </div>
            <button onClick={handleStep3} className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
              Next <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fixed inset-0 top-[72px] flex">
            {/* Left: Full-size map */}
            <div className="flex-1 relative">
              <LocationPicker location={pickedLocation} onLocationChange={setPickedLocation} address={address} />
            </div>

            {/* Right: Location info + Submit */}
            <div className="w-96 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-blue-300">location_on</span>
                </div>
                <h2 className="text-lg font-bold text-white/90 mb-1">Pin Location</h2>
                <p className="text-sm text-white/50">Move the map to adjust the pin</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <span className="material-symbols-outlined text-base text-cyan-300">map</span>
                  <span className="text-sm font-medium">Selected Area</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {address || (
                    pickedLocation
                      ? `${pickedLocation.lat.toFixed(4)}, ${pickedLocation.lng.toFixed(4)}`
                      : 'Detecting location...'
                  )}
                </p>
              </div>

              <button onClick={handleSubmit} disabled={submitting} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><span className="material-symbols-outlined text-lg">check</span> Submit Report</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
