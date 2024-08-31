import Link from 'next/link';

export default function TitleCard({ title }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <Link href={`/title/${title.id}`} className="text-xl font-semibold hover:text-blue-500">
        {title.name}
      </Link>
      <p className="mt-2 text-gray-600">Entries: {title.totalEntries}</p>
      <p className="text-sm text-gray-500 mt-2">
        Created on: {new Date(title.creationTimestamp * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}