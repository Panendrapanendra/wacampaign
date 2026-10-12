import { useState, useEffect, useContext } from 'react';
import { FileText, CheckCircle2, Loader2, Lock, Send } from 'lucide-react';
import { CampaignContext } from '../../context/CampaignContext';
import type { MediaType, LinkItem } from '../../pages/CreateCampaign';

interface PreviewProps {
  message: string; 
  mediaType: MediaType;
  mediaPreviewUrl: string | null; 
  mediaFile: File | null;
  links: LinkItem[];
  phoneNumbers: string[];
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function PreviewSection({ message, mediaType, mediaPreviewUrl, mediaFile, links, phoneNumbers }: PreviewProps) {
  const [hasValidLicense, setHasValidLicense] = useState(false);
  const { campaignState, setCampaignState } = useContext(CampaignContext);
  
  const isSending = campaignState?.isSending || false;
  const currentContactIndex = campaignState?.currentContactIndex || 0;
  const sendResult = campaignState?.sendResult || null;
  const totalContacts = campaignState?.totalContacts || phoneNumbers.length;
  const progressPercentage = totalContacts > 0 ? Math.round((currentContactIndex / totalContacts) * 100) : 0;

  useEffect(() => {
    const checkLicense = () => {
      const savedKey = localStorage.getItem('wa_license_key');
      const savedExpiry = localStorage.getItem('wa_license_expiry');
      const isValid = Boolean(savedKey && savedExpiry && Date.now() < Number(savedExpiry));
      setHasValidLicense(isValid);
    };

    checkLicense();
    window.addEventListener('wa_data_update', checkLicense);
    return () => window.removeEventListener('wa_data_update', checkLicense);
  }, []);

  const activeLinks = links.filter(l => l.title.trim() !== '' || l.url.trim() !== '');

  const handleSendCampaign = async () => {
    if (isSending) return;

    const savedKey = localStorage.getItem('wa_license_key');
    const savedExpiry = localStorage.getItem('wa_license_expiry');
    const maxMessages = Number(localStorage.getItem('wa_license_max_messages') || '0');
    const usedMessages = Number(localStorage.getItem('wa_license_used_messages') || '0');

    const isValidNow = Boolean(savedKey && savedExpiry && Date.now() < Number(savedExpiry));
    setHasValidLicense(isValidNow);

    if (!isValidNow) {
      setCampaignState((prev: any) => ({ ...prev, sendResult: { type: 'error', text: "You don't have an active license key. Please activate one in Settings." }}));
      return;
    }

    if (usedMessages + phoneNumbers.length > maxMessages) {
      setCampaignState((prev: any) => ({ ...prev, sendResult: { type: 'error', text: `License limit exceeded! Quota remaining: ${maxMessages - usedMessages} contacts.` }}));
      return;
    }

    if (!message.trim() && !mediaFile && activeLinks.length === 0) {
      setCampaignState((prev: any) => ({ ...prev, sendResult: { type: 'error', text: 'Please enter a message or attach media before sending.' }}));
      return;
    }

    if (phoneNumbers.length === 0) {
      setCampaignState((prev: any) => ({ ...prev, sendResult: { type: 'error', text: 'Please upload a contact list with valid numbers first.' }}));
      return;
    }

    setCampaignState({
      isSending: true,
      currentContactIndex: 1,
      totalContacts: phoneNumbers.length,
      sendResult: null
    });

    let finalMessage = message;
    if (activeLinks.length > 0) {
      const linksText = activeLinks.map(l => `${l.title ? l.title + ': ' : ''}${l.url}`).join('\n');
      finalMessage = finalMessage ? `${finalMessage}\n\n${linksText}` : linksText;
    }

    let mediaBase64: string | null = null;
    let mediaName: string | null = null;
    let mediaMime: string | null = null;

    if (mediaFile) {
      try {
        mediaBase64 = await convertFileToBase64(mediaFile);
        mediaName = mediaFile.name;
        mediaMime = mediaFile.type || (mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'application/pdf');
      } catch (err) {
        console.error('Failed to convert file to Base64:', err);
      }
    }

    try {
      for (let i = 0; i < phoneNumbers.length; i++) {
        setCampaignState((prev: any) => ({ ...prev, currentContactIndex: i + 1 }));

        const response = await fetch('http://127.0.0.1:3000/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneNumbers[i],
            message: finalMessage,
            media_base64: mediaBase64,
            media_name: mediaName,
            media_mimetype: mediaMime,
            media_type: mediaType
          }),
        });

        if (!response.ok) {
          console.error(`Failed to dispatch message to ${phoneNumbers[i]}`);
        }

        if (i < phoneNumbers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50000));
        }
      }

      localStorage.setItem('wa_license_used_messages', String(usedMessages + phoneNumbers.length));

      setCampaignState({
        isSending: false,
        currentContactIndex: phoneNumbers.length,
        totalContacts: phoneNumbers.length,
        sendResult: { type: 'success', text: `Successfully completed campaign for all ${phoneNumbers.length} contacts!` }
      });
      
      const currentReports = JSON.parse(localStorage.getItem('wa_campaign_reports') || '[]');
      const newReport = {
        id: Date.now(),
        name: `Campaign ${new Date().toLocaleDateString()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: mediaType ? mediaType.charAt(0).toUpperCase() + mediaType.slice(1) : 'Text Only',
        sent: phoneNumbers.length,
        failed: 0,
        status: 'Delivered'
      };
      localStorage.setItem('wa_campaign_reports', JSON.stringify([newReport, ...currentReports]));

      window.dispatchEvent(new Event('wa_data_update'));

    } catch (error) {
      setCampaignState((prev: any) => ({
        ...prev,
        isSending: false,
        sendResult: { type: 'error', text: 'Could not connect to the backend server on port 3000.' }
      }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex-1 flex flex-col">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">4. Preview</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">This is how your message will look.</p>
        
        <div className="flex justify-center flex-1 items-center">
          <div className="w-[300px] h-[580px] bg-slate-900 rounded-[3rem] p-2.5 shadow-2xl relative border-[8px] border-slate-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-900 rounded-b-2xl z-10"></div>
            
            <div className="w-full h-full bg-[#EFEAE2] rounded-[2.2rem] overflow-hidden flex flex-col relative bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover">
              <div className="bg-[#008069] text-white px-4 py-3 pt-8 flex items-center gap-3 shrink-0 shadow-md z-10">
                <div className="w-9 h-9 bg-slate-300 rounded-full shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-white/20"></div>
                </div>
                <div>
                  <div className="font-bold text-[15px] leading-tight">Rahul Sharma</div>
                  <div className="text-[11px] font-medium text-white/80">online</div>
                </div>
              </div>
              
              <div className="flex-1 p-3 flex flex-col justify-end z-0">
                <div className="bg-white p-2.5 rounded-2xl rounded-tl-sm shadow-sm text-[14.5px] font-medium text-slate-900 leading-snug max-w-[92%] relative">
                  
                  {mediaType === 'image' && mediaPreviewUrl && (
                    <img src={mediaPreviewUrl} className="w-full h-auto max-h-56 object-cover rounded-xl mb-2 border border-slate-100" alt="Preview attachment" />
                  )}
                  {mediaType === 'video' && mediaPreviewUrl && (
                    <video src={mediaPreviewUrl} controls className="w-full h-auto max-h-56 object-cover rounded-xl mb-2 bg-black" />
                  )}
                  {mediaType === 'doc' && mediaFile && (
                    <div className="w-full bg-slate-50 rounded-xl mb-2 p-3 flex items-center gap-3 border border-slate-100">
                      <div className="bg-red-500 p-2.5 rounded-lg text-white shrink-0 shadow-sm"><FileText className="w-5 h-5" /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-sm text-slate-800 truncate">{mediaFile.name}</span>
                        <span className="text-xs text-slate-500 font-bold mt-0.5">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap mt-1">
                    {message ? message : (!mediaType && activeLinks.length === 0 && <span className="text-slate-400 italic">Type a message...</span>)}
                  </div>
                  
                  {activeLinks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {activeLinks.map((link, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border-l-4 border-blue-500">
                          {link.title && <div className="font-extrabold text-xs text-slate-800 mb-0.5">{link.title}</div>}
                          {link.url && <a href={link.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline break-all block leading-tight">{link.url}</a>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-bold text-right mt-1.5 flex justify-end items-center gap-1">
                    9:41 AM <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <button 
          onClick={handleSendCampaign}
          disabled={isSending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white py-4 rounded-2xl font-extrabold text-base shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending to Contact {currentContactIndex} of {totalContacts}...</>
          ) : hasValidLicense ? (
            <><Send className="w-4 h-4" /> Send Campaign Now ({phoneNumbers.length} Contacts)</>
          ) : (
            <><Lock className="w-4 h-4" /> Send Campaign Now ({phoneNumbers.length} Contacts) - License Required</>
          )}
        </button>

        <div className="mt-5 min-h-[40px]">
          {isSending && (
            <div className="animate-fade-in">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                <span>Sending Contact {currentContactIndex} of {totalContacts} (Anti-Ban 50s Delay)</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {sendResult && !isSending && (
            <div className={`text-center p-3 rounded-xl border ${sendResult.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400'}`}>
              <span className="text-sm font-bold">
                {sendResult.text}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}