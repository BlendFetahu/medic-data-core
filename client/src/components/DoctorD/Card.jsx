
export default function Card({ title, right, children }) {
  return (
    <section className="bg-white rounded-2xl shadow p-4 border border-gray-200">
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title ? <h2 className="font-medium text-lg">{title}</h2> : <div />}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
