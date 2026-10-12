import { Search, Download, Plus, Users } from 'lucide-react';

export default function Contacts() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-green-600" /> Contact Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your uploaded contacts.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm" />
          </div>
        </div>
        <div className="p-12 text-center text-gray-500 text-sm">
          No contacts saved in the database yet.
        </div>
      </div>
    </div>
  );
}