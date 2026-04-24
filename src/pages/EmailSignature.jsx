import React from 'react';
import signatures from '../data/signatures.json';

const installLinks = [
  { name: 'Gmail', url: 'https://support.google.com/mail/answer/56256' },
  { name: 'Outlook', url: 'https://support.microsoft.com/office/add-an-image-to-your-email-signature-8ee20c2d-ee83-4b5e-b9e6-7de9a2a7f0de' },
  { name: 'Apple Mail (macOS)', url: 'https://support.apple.com/guide/mail/use-and-create-email-signatures-mlhlp1001/mac' },
  { name: 'Apple Mail (iPhone)', url: 'https://support.apple.com/guide/mail/use-and-create-email-signatures-mlhlp1001/ios' }
];

export default function EmailSignature() {
  const [query, setQuery] = React.useState('');
  const filtered = signatures.filter(id =>
    id.replace(/-/g, ' ').toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-switch-bold text-4xl mb-6 text-center bg-gradient-to-r from-[#0951fa] to-[#0a7cff] bg-clip-text text-transparent">Email Signatures</h1>
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search your name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-900/70 border border-white/15 focus:border-[#0951fa]/60 focus:outline-none focus:ring-2 focus:ring-[#0951fa]/30 backdrop-blur-md text-white placeholder-gray-300 text-base transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.map(id => (
            <div key={id} className="rounded-xl overflow-hidden bg-gradient-to-br from-[#0951fa]/25 from-0% via-[#0951fa]/5 via-45% to-gray-900/70 to-100% border border-white/10 hover:border-[#0951fa]/50 shadow-xl hover:shadow-2xl backdrop-blur-md transition-all duration-300 p-5">
              <div className="rounded-lg overflow-hidden bg-white mb-4">
                <img
                  src={
                    id === 'Renee-Mesecher'
                      ? '/signatures/images/RENEE-RIMMER-MESECHER.jpg'
                      : id === 'Susie-Velasquez'
                      ? `/signatures/images/${id}.jpg?v=3`
                      : id === 'Cathy-Cranford'
                      ? `/signatures/images/${id}.jpg?v=3`
                      : `/signatures/images/${id}.jpg`
                  }
                  alt={`${id === 'Renee-Mesecher' ? 'Reneé Mesecher' : id.replace(/-/g, ' ')} signature preview`}
                  className="w-full block"
                />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-white">
                {id === 'Renee-Mesecher' ? 'Reneé Mesecher' : id.replace(/-/g, ' ')}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <a
                  href={`/signatures/${id}.html`}
                  download={`${id}.html`}
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/20 via-50% to-gray-900/60 to-100% border border-[#0951fa]/50 hover:border-[#0951fa]/70 backdrop-blur-md transition-all"
                >
                  Download HTML
                </a>
                <a
                  href={`/signatures/${id}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 bg-gradient-to-br from-gray-800/60 to-gray-900/40 border border-white/10 hover:border-white/25 backdrop-blur-md transition-all"
                >
                  Open Signature
                </a>
              </div>
              <a
                href="/signatures/Email-Signature-Instructions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-[#0a7cff] hover:underline"
              >
                Installation Instructions (PDF) →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
