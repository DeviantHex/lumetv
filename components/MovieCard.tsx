import Link from 'next/link'
export default function MovieCard({ data, type }: { data:any; type:'movie'|'tv' }) {
  const title = data.title || data.name || data.original_title || 'Untitled';
  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '/placeholder.png';
  const routeType = type === 'tv' ? 'tv' : 'movie';
  return (
    <Link href={`/watch/${routeType}/${data.id}`}>
      <div className="bg-[var(--card)] rounded overflow-hidden shadow hover:scale-105 transition-transform duration-200">
        <img src={poster} alt={title} className="w-full h-64 object-cover" />
        <div className="p-3">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          <p className="text-xs text-[var(--muted)] mt-1">{(data.year || data.release_date || '').toString().slice(0,4)}</p>
        </div>
      </div>
    </Link>
  )
}
