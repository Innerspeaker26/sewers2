import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Upload, Calendar, X } from 'lucide-react';

const ManholeTracker = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState('');
  const [issueType, setIssueType] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a modern browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Error getting location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your device\'s GPS or try again.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please check your internet connection and try again.';
            break;
          default:
            errorMessage += 'Please try again or enter the location manually.';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setPhoto(file);
      setError('');
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!photo) {
        throw new Error('Please upload a photo.');
      }

      if (!location.lat || !location.lng) {
        throw new Error('Please get your current location.');
      }

      if (!issueType) {
        throw new Error('Please select an issue type.');
      }

      if (!address) {
        throw new Error('Please enter a reference address.');
      }

      const formData = {
        photo,
        latitude: location.lat,
        longitude: location.lng,
        issueType,
        address,
        date
      };

      // Here you would typically send the data to your backend
      console.log('Submitted data:', formData);

      // Reset form
      setPhoto(null);
      setPhotoPreview(null);
      setLocation({ lat: null, lng: null });
      setIssueType('');
      setAddress('');
      setDate(new Date().toISOString().split('T')[0]);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Manhole Issue Reporter</h1>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload - First */}
              <div className="space-y-2">
                <Label>Photo of the Issue *</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full"
                    />
                  </div>
                  
                  {photoPreview && (
                    <div className="relative w-32 h-32">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Section - Second */}
              <div className="space-y-2">
                <Label>Location *</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-center">
                    <Button 
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Get Current Location
                    </Button>
                    {location.lat && (
                      <span className="text-sm text-gray-600">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </span>
                    )}
                  </div>
                  {error && error.includes('location access') && (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Location Access Required</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Please enable location access:</p>
                            <ol className="list-decimal ml-4 mt-1">
                              <li>Click the {navigator.userAgent.includes('Firefox') ? '🔒' : navigator.userAgent.includes('Safari') ? 'Safari menu' : '🔒'} icon in your address bar</li>
                              <li>{navigator.userAgent.includes('Firefox') ? 'Select "Clear Permission"' : navigator.userAgent.includes('Safari') ? 'Go to Preferences > Privacy' : 'Click "Site settings"'}</li>
                              <li>Set location access to "Allow"</li>
                              <li>Refresh the page</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Type Selection - Third */}
              <div className="space-y-2">
                <Label>Issue Type *</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missing">Missing Manhole</SelectItem>
                    <SelectItem value="damaged">Damaged Manhole</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address Input - Fourth */}
              <div className="space-y-2">
                <Label>Reference Address *</Label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter street address"
                  className="w-full"
                />
              </div>

              {/* Date Input - Last */}
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManholeTracker;