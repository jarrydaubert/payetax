import Link from 'next/link';

interface ToolCardProps {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export default function ToolCard({ slug, title, description, icon }: ToolCardProps) {
  return (
    <Link href={`/tools/${slug}`} className="block bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors shadow-md">
      <h2 className="text-base font-semibold md:text-lg text-gray-100 mb-2">
        <i className={`fas ${icon} mr-2 text-blue-500`}></i>{title}
      </h2>
      <p className="text-gray-300 text-sm md:text-base">{description}</p>
    </Link>
  );
}