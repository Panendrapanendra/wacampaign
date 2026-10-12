import { Image, Video, FileText, Link as LinkIcon, Plus, X } from 'lucide-react';
import type { MediaType, LinkItem } from '../../pages/CreateCampaign';

interface MessageProps {
  message: string;
  setMessage: (m: string) => void;
  mediaType: MediaType;
  setMediaType: (t: MediaType) => void;
  setMediaFile: (f: File | null) => void;
  setMediaPreviewUrl: (url: string | null) => void;
  links: LinkItem[];
  setLinks: (l: LinkItem[]) => void;
}

export default function MessageEditor({ message, setMessage, mediaType, setMediaType, setMediaFile, setMediaPreviewUrl, links, setLinks }: MessageProps) {

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType(type);
      setMediaFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMediaType(null);
    setMediaFile(null);
    setMediaPreviewUrl(null);
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex flex-col h-full">
      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">3. Create Message</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Personalize with text, media and links.</p>

      {/* Message Textarea */}
      <div className="relative mb-6">
        <textarea
          rows={6}
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
          {message.length}/1024
        </div>
      </div>

      {/* Add Media Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-900 dark:text-white">Add Media</label>
          {mediaType ? (
            <button onClick={removeMedia} className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"><X className="w-3 h-3"/> Clear File</button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Optional</span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'image', icon: Image, label: 'Image', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30' },
            { id: 'video', icon: Video, label: 'Video', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30' },
            { id: 'doc', icon: FileText, label: 'Doc', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/30' }
          ].map((type) => (
            <label 
              key={type.id} 
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                mediaType === type.id 
                  ? `${type.border}${type.bg} ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900` 
                  : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'
              } ${mediaType && mediaType !== type.id ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <input 
                type="file" 
                accept={type.id === 'image' ? 'image/*' : type.id === 'video' ? 'video/*' : '.pdf,.doc,.docx'} 
                className="hidden"
                disabled={mediaType !== null && mediaType !== type.id}
                onChange={(e) => handleMediaUpload(e, type.id as MediaType)}
              />
              <type.icon className={`w-6 h-6 mb-2 ${mediaType === type.id ? type.color : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`text-xs font-bold ${mediaType === type.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Add Links Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-900 dark:text-white">Add Links</label>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Optional</span>
        </div>

        <div className="space-y-3 mb-4">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Title (e.g. Site)" 
                value={link.title}
                onChange={(e) => updateLink(index, 'title', e.target.value)}
                className="w-1/3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="url" 
                  placeholder="URL (https://...)" 
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addLink}
          className="w-full py-3 mt-auto rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Another Link
        </button>
      </div>
    </div>
  );
}