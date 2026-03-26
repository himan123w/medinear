import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { medicineAPI, aiAPI } from '../api';
import './MedicineScan.css';

const stopStream = (stream) => {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
};

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n|\n|\r/g, ' ')
    .replace(/[^A-Za-z0-9\s\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const stopwords = new Set(['and', 'or', 'the', 'this', 'that', 'mg', 'ml', 'tablet', 'tablets', 'capsule', 'capsules', 'strip', 'prescription', 'take', 'per', 'day']);

const extractCandidateMedicineNames = (text) => {
  const normalized = normalizeText(text).toLowerCase();
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 2 && !stopwords.has(t));
  const uniqueTokens = [...new Set(tokens)];

  // Keep multi-word tokens by joining adjacent words if they look like names
  if (uniqueTokens.length === 0 && normalized.length > 0) {
    return [normalized.substring(0, 100)];
  }

  return uniqueTokens.slice(0, 8);
};

export default function MedicineScan({ onMedicineDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [candidateTerms, setCandidateTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState('');
  const [googleProcessing, setGoogleProcessing] = useState(false);
  const [tesseractProcessing, setTesseractProcessing] = useState(false);

  useEffect(() => {
    return () => {
      stopStream(stream);
    };
  }, [stream]);

  const startCamera = async () => {
    setError('');
    setStatusMessage('Requesting camera access...');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API is not supported in this browser.');
      setStatusMessage('');
      return;
    }

    try {
      const streamObj = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = streamObj;
      }
      setStream(streamObj);
      setIsCameraActive(true);
      setStatusMessage('Camera started. Position the medicine strip or prescription clearly.');
    } catch (err) {
      console.error('Camera start error', err);
      setError('Unable to start camera. Please check permissions and try again.');
      setStatusMessage('');
    }
  };

  const stopCamera = () => {
    stopStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCameraActive(false);
    setStatusMessage('Camera stopped.');
  };

  const captureAndScan = async () => {
    setError('');
    setStatusMessage('Capturing image and running OCR...');

    if (!videoRef.current) {
      setError('Camera not initialized');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas not available');
      return;
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
      setTesseractProcessing(true);
      setOcrProgress(0);
      const result = await Tesseract.recognize(imageBase64, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const rawText = result.data?.text || '';
      setOcrText(rawText);
      const candidates = extractCandidateMedicineNames(rawText);
      setCandidateTerms(candidates);
      setSelectedTerm(candidates[0] || '');
      setStatusMessage('OCR complete. Select a candidate to search medicine details.');

      if (candidates.length > 0) {
        await searchMedicine(candidates[0]);
      }
    } catch (err) {
      console.error('Tesseract OCR error', err);
      setError('OCR failed. Try again with better lighting or a clearer shot.');
      setStatusMessage('');
    } finally {
      setTesseractProcessing(false);
      setOcrProgress(0);
    }

    return;
  };

  const searchMedicine = async (query) => {
    if (!query || query.trim().length < 3) {
      setError('Provide a medicine name to search.');
      return;
    }

    setError('');
    setStatusMessage(`Searching for ${query}...`);
    try {
      const response = await medicineAPI.smartSearch(query);
      const medicines = response.data?.data || [];
      setSearchResults(medicines);
      onMedicineDetected?.(medicines);
      setStatusMessage(`Found ${medicines.length} medicine(s).`);
    } catch (err) {
      console.error('Medicine search error', err);
      setError('Search failed. Please try again.');
      setStatusMessage('');
    }
  };

  const callGoogleVision = async () => {
    setError('');
    setGoogleProcessing(true);
    setStatusMessage('Sending image to Google Vision API...');

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError('No captured image available. Take a snapshot first.');
        return;
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const response = await aiAPI.extractTextWithGoogleVision(dataUrl);
      const extractedText = response.data?.data?.extractedText || '';
      setOcrText(extractedText);

      const candidates = extractCandidateMedicineNames(extractedText);
      setCandidateTerms(candidates);
      setSelectedTerm(candidates[0] || '');
      setStatusMessage('Google Vision OCR completed.');

      if (candidates[0]) {
        await searchMedicine(candidates[0]);
      }
    } catch (err) {
      console.error('Google Vision error', err);
      setError(err?.response?.data?.message || 'Google Vision call failed. Check API key and quota.');
      setStatusMessage('');
    } finally {
      setGoogleProcessing(false);
    }
  };

  return (
    <section className="medicine-scan-widget">
      <h3>📷 Medicine Scan (Camera OCR)</h3>
      <p>Scan a medicine strip, box, or prescription and auto-detect medicine name.</p>

      <div className="top-controls">
        {!isCameraActive ? (
          <button onClick={startCamera} className="btn btn-secondary">Start Camera</button>
        ) : (
          <button onClick={stopCamera} className="btn btn-danger">Stop Camera</button>
        )}

        {isCameraActive && (
          <button onClick={captureAndScan} className="btn btn-primary" disabled={tesseractProcessing || googleProcessing}>
            {tesseractProcessing ? `OCR ${ocrProgress}%` : 'Capture & Tesseract OCR'}
          </button>
        )}

        <button onClick={callGoogleVision} className="btn btn-info" disabled={!canvasRef.current || googleProcessing}>
          {googleProcessing ? 'Google Vision...' : 'Google Vision OCR'}
        </button>
      </div>

      {statusMessage && <div className="scan-status">{statusMessage}</div>}
      {error && <div className="scan-error">{error}</div>}

      <div className="scan-area">
        <div className="video-container">
          <video ref={videoRef} autoPlay muted playsInline className="scan-video" />
          <canvas ref={canvasRef} className="scan-canvas" style={{ display: 'none' }} />
        </div>

        <div className="scan-results">
          <label htmlFor="detectedMedicine">Detected candidate names</label>
          <select
            id="detectedMedicine"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">-- Select Candidate --</option>
            {candidateTerms.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>

          <button
            className="btn btn-outline"
            disabled={!selectedTerm}
            onClick={() => searchMedicine(selectedTerm)}
          >
            Search Extracted Medicine
          </button>

          <div className="ocr-output">
            <h4>OCR Text</h4>
            <textarea value={ocrText} readOnly rows={6} />
          </div>

          <div className="search-results">
            <h4>Search Results ({searchResults.length})</h4>
            {searchResults.length === 0 && <p>No results yet</p>}
            <ul>
              {searchResults.map((med) => (
                <li key={med._id || med.id || med.name}>
                  <strong>{med.name}</strong> {med.manufacturer ? `• ${med.manufacturer}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
