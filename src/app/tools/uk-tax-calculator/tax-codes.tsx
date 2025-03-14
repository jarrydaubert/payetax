// src/app/tools/uk-tax-calculator/tax-codes/page.tsx
export default function TaxCodes() {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">UK Tax Codes Explained</h1>
        <p className="mb-4 text-gray-400">Understand your tax code and how it affects your pay.</p>
        <table className="w-full text-sm text-gray-100 border border-gray-600 mb-6">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2">1257L</td><td className="p-2">Standard tax-free allowance of £12,570.</td></tr>
            <tr><td className="p-2">BR</td><td className="p-2">Basic Rate (20%) on all income, no allowance.</td></tr>
            <tr><td className="p-2">NT</td><td className="p-2">No tax deducted.</td></tr>
          </tbody>
        </table>
      </div>
    );
  }