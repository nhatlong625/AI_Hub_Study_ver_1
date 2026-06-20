// components/common/ShareDocumentModal.jsx
// Modal Share Document — hiện link share, nút Copy, nút Revoke.
// Mở ra từ DocumentActionMenu trong StudentLibraryCourseDetailPage.

import { useState, useEffect } from "react";
import { documentApi } from "../../services/libraryApi";

export default function ShareDocumentModal({ doc, userId = 1, onClose }) {
  const [shareUrl, setShareUrl] = useState(null);
  const [shareId, setShareId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Khi mở modal, tự động tạo/lấy link share
  useEffect(() => {
    documentApi
      .createShareLink(doc.documentId, userId)
      .then((res) => {
        setShareUrl(res.shareUrl);
        setShareId(res.shareId);
      })
      .catch((err) => setError(err.message || "Could not create share link."))
      .finally(() => setLoading(false));
  }, [doc.documentId, userId]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback nếu clipboard API không được phép
      setError("Could not copy — please copy the link manually.");
    }
  }

  async function handleRevoke() {
    if (
      !window.confirm(
        "Disable this link? Anyone with the link will lose access.",
      )
    )
      return;
    setRevoking(true);
    try {
      await documentApi.revokeShareLink(doc.documentId, userId);
      setShareUrl(null);
      setShareId(null);
    } catch (err) {
      setError(err.message || "Could not disable link.");
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[480px] mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">Share Document</h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-[300px]">
              {doc.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              Generating link...
            </div>
          ) : error ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : shareUrl ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Anyone with this link can view the document and its AI summary.
              </p>

              {/* Link box */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                  className="flex-shrink-0"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="text-sm text-gray-600 flex-1 truncate font-mono">
                  {shareUrl}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors " +
                    (copied
                      ? "bg-green-500 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white")
                  }
                >
                  {copied ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>

                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {revoking ? "Disabling..." : "Disable link"}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Disable link to revoke access. Share again to generate a new
                one.
              </p>
            </>
          ) : (
            // Sau khi revoke
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 mb-4">
                No active share link. Click below to create one.
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError("");
                  documentApi
                    .createShareLink(doc.documentId, userId)
                    .then((res) => {
                      setShareUrl(res.shareUrl);
                      setShareId(res.shareId);
                    })
                    .catch((err) =>
                      setError(err.message || "Could not create share link."),
                    )
                    .finally(() => setLoading(false));
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Generate Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
