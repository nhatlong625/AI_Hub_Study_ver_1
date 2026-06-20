import { useMemo } from "react";

// TODO: kết nối API search thật
const semesters = [];
const generateCourseFiles = () => [];


// Lấy tất cả tài liệu từ các môn phổ biến để search
const SEARCH_COURSES = [
  "MAE101",
  "CSI104",
  "CSI105",
  "DBI202",
  "PRJ301",
  "SWP391",
  "MAD101",
];
const allDocs = SEARCH_COURSES.flatMap((c) => generateCourseFiles(c, 9));

// Lấy tất cả môn học từ tất cả kỳ
const allCourses = semesters.flatMap((s) =>
  s.courses.map((c) => ({ code: c, semester: s.label, semesterId: s.id })),
);

export default function TopbarSearchDropdown({
  query,
  onCourseClick,
  onFileClick,
  onClose,
}) {
  const q = query.trim().toLowerCase();

  const courseResults = useMemo(() => {
    if (!q) return [];
    return allCourses
      .filter((c) => c.code.toLowerCase().includes(q))
      .slice(0, 5);
  }, [q]);

  const docResults = useMemo(() => {
    if (!q) return [];
    return allDocs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.courseId?.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [q]);

  const hasResults = courseResults.length > 0 || docResults.length > 0;

  if (!q) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 top-12 z-50 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {!hasResults ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No results for{" "}
            <span className="font-semibold text-gray-600">"{query}"</span>
          </div>
        ) : (
          <>
            {/* Courses */}
            {courseResults.length > 0 && (
              <div className="px-5 pt-4 pb-2">
                <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-2">
                  Courses
                </p>
                {courseResults.map((c) => (
                  <button
                    key={`${c.code}-${c.semesterId}`}
                    onClick={() => {
                      onCourseClick(c.code, c.semester);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.code}
                      </p>
                      <p className="text-xs text-gray-400">{c.semester}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {courseResults.length > 0 && docResults.length > 0 && (
              <div className="h-px bg-gray-100 mx-5" />
            )}

            {/* Documents */}
            {docResults.length > 0 && (
              <div className="px-5 pt-3 pb-4">
                <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-2">
                  Documents
                </p>
                {docResults.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onFileClick(d);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {d.courseId} • {d.uploader}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
