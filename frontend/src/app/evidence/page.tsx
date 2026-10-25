'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  FileWarning,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EvidenceItem } from '@/types';
import { getEvidenceRecords, uploadEvidenceRecord, verifyEvidenceRecord } from '@/lib/api';

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadAppId, setUploadAppId] = useState<number>(1);
  const [uploadDocType, setUploadDocType] = useState<string>('fire_safety_noc');
  const [uploadReqId, setUploadReqId] = useState<string>('3');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState<EvidenceItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const data = await getEvidenceRecords({ status: selectedStatus });
      setEvidenceList(data);
    } catch (e) {
      console.error('Failed to fetch evidence records', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [selectedStatus]);

  const handleVerify = async (item: EvidenceItem) => {
    const success = await verifyEvidenceRecord(item.id, 'verified');
    if (success) {
      setFeedbackMessage({
        type: 'success',
        text: `Document "${item.fileName}" has been officially marked as VERIFIED.`,
      });
      fetchEvidence();
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to update verification status. Please try again.',
      });
    }
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      alert('Rejection reason is mandatory under AICTE statutory scrutiny guidelines.');
      return;
    }

    setIsSubmittingReject(true);
    const success = await verifyEvidenceRecord(
      rejectingItem.id,
      'rejected',
      rejectionReason.trim()
    );
    setIsSubmittingReject(false);

    if (success) {
      setFeedbackMessage({
        type: 'success',
        text: `Document "${rejectingItem.fileName}" was REJECTED. Automatic compliance breach alert created.`,
      });
      setRejectingItem(null);
      setRejectionReason('');
      fetchEvidence();
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to record rejection decision.',
      });
    }
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a PDF or image file to upload.');
      return;
    }

    setIsSubmittingUpload(true);
    const formData = new FormData();
    formData.append('application_id', uploadAppId.toString());
    formData.append('document_type', uploadDocType);
    if (uploadReqId) formData.append('requirement_id', uploadReqId);
    formData.append('file', uploadFile);

    const success = await uploadEvidenceRecord(formData);
    setIsSubmittingUpload(false);

    if (success) {
      setFeedbackMessage({
        type: 'success',
        text: `Uploaded "${uploadFile.name}" successfully. Queued for official scrutiny.`,
      });
      setIsUploadOpen(false);
      setUploadFile(null);
      fetchEvidence();
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Upload failed. Please ensure file is valid and backend is reachable.',
      });
    }
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black/5 rounded text-slate-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Evidence & Document Repository
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Audit Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit-linked institutional verification documents, fire safety certificates, and financial receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-transparent text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Scrutiny</option>
              <option value="verified">Verified Proofs</option>
              <option value="rejected">Rejected Documents</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchEvidence}
            className="p-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Institution & App No.</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4 text-right">Scrutiny Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {evidenceList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{doc.fileName}</p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {doc.documentType.replace(/_/g, ' ')}
                      {doc.requirementTitle ? ` — ${doc.requirementTitle}` : ''}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900">{doc.institutionName}</p>
                    <span className="font-mono text-[11px] text-slate-500">{doc.applicationNumber}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {doc.verifiedStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <FileCheck2 className="h-3 w-3" />
                        Verified Proof
                      </span>
                    )}
                    {doc.verifiedStatus === 'rejected' && (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <FileWarning className="h-3 w-3" />
                          Rejected
                        </span>
                        {doc.rejectionReason && (
                          <span className="block text-[10px] text-rose-600 mt-0.5 max-w-xs truncate" title={doc.rejectionReason}>
                            {doc.rejectionReason}
                          </span>
                        )}
                      </div>
                    )}
                    {(doc.verifiedStatus === 'pending' || !doc.verifiedStatus) && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Pending Scrutiny
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {formatFileSize(doc.fileSizeBytes)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(doc.uploadedAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {doc.verifiedStatus !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerify(doc)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          title="Mark verified"
                        >
                          Verify
                        </button>
                      )}
                      {doc.verifiedStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingItem(doc);
                            setRejectionReason('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                          title="Reject document with reason"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {evidenceList.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No evidence records matching the selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload Institutional Evidence</h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Application
                </label>
                <select
                  value={uploadAppId}
                  onChange={(e) => setUploadAppId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                >
                  <option value={1}>APP-2026-UP-0012 — Apex Institute of Technology</option>
                  <option value={2}>APP-2026-MH-0045 — Vidya Sagar College of Engineering</option>
                  <option value={3}>APP-2026-OD-0023 — Kalinga Polytechnic Institute</option>
                  <option value={4}>APP-2026-KA-0089 — Deccan Academy of Technology</option>
                  <option value={5}>APP-2026-GJ-0034 — Gujarat Institute of Advanced Studies</option>
                  <option value={6}>APP-2026-KL-0078 — Malabar Engineering College</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                >
                  <option value="fire_safety_noc">State Fire Safety NOC Certificate</option>
                  <option value="faculty_roster">Certified Faculty Roster & Form 16</option>
                  <option value="land_title_deed">Land Title Deed & Khasra Ledger</option>
                  <option value="fdr_corpus_receipt">Joint FDR Corpus Receipt</option>
                  <option value="building_stability_cert">Structural Stability Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requirement Link (Optional ID)
                </label>
                <input
                  type="text"
                  value={uploadReqId}
                  onChange={(e) => setUploadReqId(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Document File (.pdf, .jpg, .png)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-2 font-medium rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpload}
                  className="px-4 py-2 font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmittingUpload ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-rose-600" />
                Reject Evidence Document
              </h3>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are rejecting <strong>{rejectingItem.fileName}</strong> for application{' '}
              <strong className="font-mono">{rejectingItem.applicationNumber}</strong>. Under AICTE scrutiny norms, an official explanation is mandatory and will immediately trigger a critical compliance breach alert for the institution.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. State Fire Safety certificate validity expired on 30 Sept 2026. Renewal certificate required."
                className="w-full p-2.5 text-xs border border-rose-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
