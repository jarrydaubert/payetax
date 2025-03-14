'use client';

import React from 'react';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="container mx-auto p-6 text-gray-100">
      <h1 className="text-2xl font-bold mb-4 md:text-3xl">
        <i className="fas fa-cookie-bite mr-2 text-blue-500"></i>Cookie Policy
      </h1>
      <p className="mb-4 text-gray-400">
        Last updated: March 14, 2025
      </p>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
        <p className="text-gray-400">
          ToolHubX ({"we"}, {"us"}, or {"our"}) uses cookies to enhance your experience on our website at{' '}
          <a href="https://toolhubx.uk" className="text-blue-500 hover:underline">toolhubx.uk</a>. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. What Are Cookies?</h2>
        <p className="text-gray-400">
          Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, improve site functionality, and analyze usage.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. How We Use Cookies</h2>
        <p className="text-gray-400">We use cookies for the following purposes:</p>
        <ul className="list-disc pl-5 text-gray-400">
          <li><strong>Essential Cookies:</strong> Required for basic site functionality (e.g., saving expense lists locally via Local Storage).</li>
          <li><strong>Analytics Cookies:</strong> To understand how users interact with our site (e.g., Google Analytics with ID G-99DW6ZQWMT).</li>
          <li><strong>Preference Cookies:</strong> To remember your settings (e.g., tax year selection).</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Cookies We Use</h2>
        <p className="text-gray-400">
          - <strong>Local Storage:</strong> Stores your expense list data (e.g., <code>expensesList</code>) on your device.<br />
          - <strong>Google Analytics:</strong> Uses cookies (_ga, _gid, etc.) to track usage and performance. Data is anonymized and used to improve our services. See <a href="https://policies.google.com/technologies/cookies" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Google’s Cookie Policy</a>.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. Your Choices</h2>
        <p className="text-gray-400">
          You can accept cookies by clicking {"Accept"} on the banner or manage them via your browser settings. To disable Local Storage, clear your browser data. For Google Analytics, use the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>. Disabling essential cookies may affect site functionality.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">6. Contact Us</h2>
        <p className="text-gray-400">
          For questions, contact us at <a href="mailto:support@toolhubx.uk" className="text-blue-500 hover:underline">support@toolhubx.uk</a>.
        </p>
      </section>
      <Link href="/" className="text-blue-500 hover:underline">
        <i className="fas fa-arrow-left mr-2"></i>Back to Home
      </Link>
    </div>
  );
};