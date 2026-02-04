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
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Email Signatures</h1>
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search your name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-shadow duration-200"
          />
        </div>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.map(id => (
            <div key={id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4">
              <img
                src={
                  id === 'Renee-Mesecher'
                    ? '/signatures/images/RENEE-RIMMER-MESECHER.jpg'
                    : id === 'Susie-Velasquez'
                    ? `/signatures/images/${id}.jpg?v=2`
                    : id === 'Cathy-Cranford'
                    ? `/signatures/images/${id}.jpg?v=3`
                    : `/signatures/images/${id}.jpg`
                }
                alt={`${id === 'Renee-Mesecher' ? 'Reneé Mesecher' : id.replace(/-/g, ' ')} signature preview`}
                className="w-full block mb-4"
              />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {id === 'Renee-Mesecher' ? 'Reneé Mesecher' : id.replace(/-/g, ' ')}
              </h2>
              <div className="flex space-x-2 mb-4">
                <a
                  href={`/signatures/${id}.html`}
                  download={`${id}.html`}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Download HTML
                </a>
                <a
                  href={`/signatures/${id}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                >
                  Open Signature
                </a>
              </div>
              {/* Installation instructions PDF link */}
              <div className="mt-4">
                <a
                  href="/signatures/Email-Signature-Instructions.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:underline"
                >
                  Installation Instructions (PDF)
                </a>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
