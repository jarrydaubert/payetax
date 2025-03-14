import React from 'react';
import Link from 'next/link';

interface Props {
  taxYear: string;
}

const Glossary: React.FC<Props> = ({ taxYear }) => (
  <div className="mt-6 p-4 bg-gray-800 rounded shadow-md">
    <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl">
      <i className="fas fa-book mr-2 text-blue-500"></i>Glossary
    </h2>
    <ul className="list-disc pl-5 text-gray-100 text-sm space-y-2">
      <li><strong><i className="fas fa-money-bill-wave mr-2"></i>Profit Before Tax</strong>: Revenue minus expenses and salary.</li>
      <li><strong><i className="fas fa-hand-holding-usd mr-2"></i>Corporation Tax</strong>: {taxYear === '2024' ? '19%' : '20%'} up to £50,000, {taxYear === '2024' ? '25%' : '26%'} above £250,000, with marginal relief between.</li>
      <li><strong><i className="fas fa-id-card mr-2"></i>Employer NI</strong>: {taxYear === '2024' ? '13.8%' : '15%'} above £{taxYear === '2024' ? '9,100' : '5,000'} on salary.</li>
      <li><strong><i className="fas fa-receipt mr-2"></i>VAT</strong>: 20% on revenue if registered (mandatory over £90,000 turnover).</li>
      <li><strong><i className="fas fa-money-check-alt mr-2"></i>Dividend Tax</strong>: {taxYear === '2024' ? '8.75%' : '9%'} (basic), {taxYear === '2024' ? '33.75%' : '34%'} (higher), {taxYear === '2024' ? '39.35%' : '40%'} (additional) above £{taxYear === '2024' ? '1,000' : '900'}.</li>
      <li><strong><i className="fas fa-wallet mr-2"></i>Net Profit After Tax</strong>: Profit after all taxes.</li>
    </ul>
    <p className="mt-4 text-gray-400 text-sm">
      For details, visit <Link href="https://www.gov.uk/corporation-tax" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC Corporation Tax</Link> or{' '}
      <Link href="https://www.gov.uk/vat-registration" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">VAT Registration</Link>. 2025/26 rates are speculative.
    </p>
  </div>
);

export default Glossary;