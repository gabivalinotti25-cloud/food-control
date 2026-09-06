export default function Card({ title, content, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{content}</p>
        </div>
      </div>
    </div>
  );
}
