import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CSVUploadModal({ onClose, onSuccess }) {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) setFile(f);
    else setError('Please drop a CSV file');
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(''); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api().post('/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="csv-upload-modal" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1C1917] transition-colors"
          data-testid="close-upload-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[#1C1917] mb-1" style={{ fontFamily: 'Manrope' }}>Upload CRM Data</h2>
        <p className="text-sm text-[#57534E] mb-6">Upload your CRM Sheet CSV file to refresh the dashboard data.</p>

        {!result ? (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#E7E5E4] rounded-xl p-8 text-center cursor-pointer hover:border-[#D97706] hover:bg-[#FEF3C7]/10 transition-all"
              data-testid="csv-drop-zone"
            >
              <Upload className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#57534E] mb-1">
                {file ? file.name : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-xs text-[#A8A29E]">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="csv-file-input"
              />
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-[#BE123C] text-sm" data-testid="upload-error">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#E7E5E4] text-[#57534E]"
                data-testid="cancel-upload-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-[#1C1917] text-white hover:bg-[#292524] gap-2"
                data-testid="confirm-upload-button"
              >
                {uploading ? 'Uploading...' : 'Upload & Replace Data'}
                {!uploading && <FileText className="w-4 h-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-lg font-semibold text-[#1C1917] mb-1">{result.message}</p>
            <p className="text-sm text-[#57534E] mb-6">{result.count?.toLocaleString()} records now in the system</p>
            <Button
              onClick={onSuccess}
              className="bg-[#1C1917] text-white hover:bg-[#292524]"
              data-testid="upload-done-button"
            >
              View Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
