export default function Header({ title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      {subtitle && <p className="text-blue-100 mt-2">{subtitle}</p>}
    </div>
  );
}
