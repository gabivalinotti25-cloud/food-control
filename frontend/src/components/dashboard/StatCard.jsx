export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
}) {

  const colors = {
    blue: "border-blue-500",
    green: "border-green-500",
    orange: "border-orange-500",
    red: "border-red-500",
  };


  return (
    <div
      className={`
        bg-white
        rounded-xl
        shadow
        p-5
        border-l-4
        ${colors[color]}
      `}
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>


          <h2 className="text-2xl font-bold mt-2">
            {value}
          </h2>

        </div>


        <div className="text-3xl">
          {icon}
        </div>


      </div>


    </div>
  );
}