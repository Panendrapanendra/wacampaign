import { useState } from 'react';
import Stepper from '../components/campaign/Stepper';
import UploadSection from '../components/campaign/UploadSection';
import MessageEditor from '../components/campaign/MessageEditor';
import PreviewSection from '../components/campaign/PreviewSection';

export type MediaType = 'image' | 'video' | 'doc' | null;
export interface LinkItem { title: string; url: string; }

export default function CreateCampaign() {
  const [message, setMessage] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([{ title: '', url: '' }]);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, duplicates: 0 });
  
  // Real extracted phone numbers state
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

  const activeLinks = links.filter(l => l.title.trim() !== '' || l.url.trim() !== '');
  let currentStep = 1;
  
  if (hasUploaded) {
    currentStep = 2;
    if (message.trim().length > 0 || mediaType !== null || activeLinks.length > 0) {
      currentStep = 3;
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <Stepper currentStep={currentStep} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <UploadSection 
          hasUploaded={hasUploaded} setHasUploaded={setHasUploaded} 
          stats={stats} setStats={setStats} 
          setPhoneNumbers={setPhoneNumbers} // Pass setter here
        />
        
        <MessageEditor 
          message={message} setMessage={setMessage} 
          mediaType={mediaType} setMediaType={setMediaType} 
          setMediaFile={setMediaFile} setMediaPreviewUrl={setMediaPreviewUrl} 
          links={links} setLinks={setLinks} 
        />
        
        <PreviewSection 
          message={message} mediaType={mediaType} 
          mediaPreviewUrl={mediaPreviewUrl} mediaFile={mediaFile} 
          links={links} phoneNumbers={phoneNumbers} // Pass real phone numbers here
        />
      </div>
    </div>
  );
}