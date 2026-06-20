function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg mb-2">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export default PageHeader;
