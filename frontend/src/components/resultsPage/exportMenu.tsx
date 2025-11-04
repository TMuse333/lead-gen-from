import { Menu, FileText, Link, Mail } from 'lucide-react';

export default function ExportMenu({  userEmail, agentEmail }: {  userEmail: string; agentEmail: string }) {
  return (
    <div className="relative group">
      <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
        <Menu size={20} />
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto">
        {/* <button onClick={onPrint} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
          <FileText size={16} /> Download PDF
        </button> */}
        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
          <Link size={16} /> Copy Link
        </button>
        <a href={`mailto:${agentEmail}?subject=My%20Property%20Analysis`} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
          <Mail size={16} /> Email Agent
        </a>
      </div>
    </div>
  );
}