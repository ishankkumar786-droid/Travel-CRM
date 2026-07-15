'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePackage, useUpdatePackage } from '@/hooks/useAgencyPortal';
import { apiClient } from '@/lib/api-client';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, MapPin, Calendar, IndianRupee } from 'lucide-react';

export function EditPackageForm({ id }: { id: string }) {
  const router = useRouter();
  const { data: pkg, isLoading: isFetching, isError } = usePackage(id);
  const updatePackage = useUpdatePackage();

  const [name, setName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [category, setCategory] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [durationNights, setDurationNights] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [itineraryDays, setItineraryDays] = useState([{ day: 1, title: '', description: '' }]);
  const [inclusions, setInclusions] = useState(['']);
  const [exclusions, setExclusions] = useState(['']);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Populate form when data arrives
  useEffect(() => {
    if (pkg && !loaded) {
      setName(pkg.name);
      setDestinationName(pkg.destinationName ?? '');
      setCategory(pkg.category);
      setDurationDays(String(pkg.durationDays));
      setDurationNights(String(pkg.durationNights));
      setPricePerPerson(String(pkg.pricePerPerson));
      setStatus(pkg.status);
      setCoverImage(pkg.coverImage ?? null);
      if (pkg.itinerary && pkg.itinerary.length > 0) {
        setItineraryDays(pkg.itinerary);
      }
      if (pkg.inclusions.length > 0) setInclusions(pkg.inclusions);
      if (pkg.exclusions.length > 0) setExclusions(pkg.exclusions);
      setLoaded(true);
    }
  }, [pkg, loaded]);

  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, { day: itineraryDays.length + 1, title: '', description: '' }]);
  };

  const removeItineraryDay = (index: number) => {
    if (itineraryDays.length > 1) {
      const newDays = [...itineraryDays];
      newDays.splice(index, 1);
      const reIndexed = newDays.map((d, i) => ({ ...d, day: i + 1 }));
      setItineraryDays(reIndexed);
    }
  };

  const updateItineraryDay = (index: number, field: string, value: string) => {
    const newDays = [...itineraryDays];
    newDays[index] = { ...newDays[index], [field]: value };
    setItineraryDays(newDays);
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    setter([...list, '']);
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setter(newList);
  };

  const updateListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverImage(data.data.url);
    } catch (err) {
      console.error('Failed to upload image', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      destinationName,
      category,
      durationDays: Number(durationDays),
      durationNights: Number(durationNights),
      pricePerPerson: Number(pricePerPerson),
      status,
      inclusions: inclusions.filter(Boolean),
      exclusions: exclusions.filter(Boolean),
      itinerary: itineraryDays.filter((d) => d.title.trim()),
      ...(coverImage ? { coverImage } : {}),
    };

    try {
      await updatePackage.mutateAsync({ id, payload });
      router.push(`/packages/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update package';
      setError(message);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Package not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/packages')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Packages
        </Button>
      </div>
    );
  }

  const isSubmitting = updatePackage.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Details */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            <p className="text-sm text-muted-foreground">General details about the travel package.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">Package Title</label>
              <Input placeholder="e.g. Majestic Kerala Backwaters" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium">Destination</label>
              <Input icon={<MapPin className="h-4 w-4" />} placeholder="e.g. Kerala, India" value={destinationName} onChange={(e) => setDestinationName(e.target.value)} required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select Category...</option>
                <option value="Adventure">Adventure</option>
                <option value="Beach">Beach &amp; Coastal</option>
                <option value="Cultural">Cultural &amp; Heritage</option>
                <option value="Luxury">Luxury</option>
                <option value="Wildlife">Wildlife &amp; Nature</option>
                <option value="Honeymoon">Honeymoon</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Duration (Days)</label>
              <Input type="number" min="1" icon={<Calendar className="h-4 w-4" />} placeholder="Days" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium">Duration (Nights)</label>
              <Input type="number" min="0" icon={<Calendar className="h-4 w-4" />} placeholder="Nights" value={durationNights} onChange={(e) => setDurationNights(e.target.value)} required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Price (Per Person)</label>
              <Input type="number" icon={<IndianRupee className="h-4 w-4" />} placeholder="e.g. 25000" value={pricePerPerson} onChange={(e) => setPricePerPerson(e.target.value)} required />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Media</h2>
          </div>
          {coverImage ? (
            <div className="relative overflow-hidden rounded-lg border border-border group">
              <img src={coverImage} alt="Cover" className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="button" variant="destructive" onClick={() => setCoverImage(null)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center rounded-lg border border-dashed border-input px-6 py-10 transition-colors hover:bg-muted/50">
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                      <label htmlFor="edit-file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary hover:text-primary/80">
                        <span>Upload a file</span>
                        <input id="edit-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itinerary */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Itinerary</h2>
              <p className="text-sm text-muted-foreground">Plan the day-by-day schedule.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItineraryDay}>
              <Plus className="mr-2 h-4 w-4" />
              Add Day
            </Button>
          </div>
          <div className="space-y-6">
            {itineraryDays.map((day, index) => (
              <div key={index} className="relative rounded-lg border border-border p-4 bg-muted/30">
                {itineraryDays.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(index)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Day {day.day}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Title</label>
                    <Input placeholder="e.g. Arrival & Sightseeing" value={day.title} onChange={(e) => updateItineraryDay(index, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Description</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Describe the day's activities..."
                      value={day.description}
                      onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inclusions & Exclusions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Inclusions</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => addListItem(setInclusions, inclusions)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {inclusions.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input placeholder="e.g. Breakfast included" value={item} onChange={(e) => updateListItem(setInclusions, inclusions, index, e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setInclusions, inclusions, index)} disabled={inclusions.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Exclusions</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => addListItem(setExclusions, exclusions)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {exclusions.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input placeholder="e.g. Flight tickets" value={item} onChange={(e) => updateListItem(setExclusions, exclusions, index, e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setExclusions, exclusions, index)} disabled={exclusions.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 py-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
