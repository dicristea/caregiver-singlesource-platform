import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Image as ImageIcon, Lock, Sparkles, X, Zap } from 'lucide-react'
import { Page } from '../../components/layout/layout'
import { api } from '../../api'
import { useStore } from '../../state/AppStore'
import './scanner.css'

const SAMPLE_DOC = { id: 'sample-levothyroxine', src: '/sample/levothyroxine-handout.png' }

type Phase = 'aiming' | 'reading'

/** B3 — Scanner. "real" uses the live camera (or photo picker); "sample" shows the bundled handout. */
export function Scanner() {
  const [params] = useSearchParams()
  const sample = params.get('mode') === 'sample'
  const navigate = useNavigate()
  const { privacy, startReview, track } = useStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  const [camera, setCamera] = useState<'starting' | 'live' | 'unavailable'>(() => (sample || !navigator.mediaDevices ? 'unavailable' : 'starting'))
  const [phase, setPhase] = useState<Phase>('aiming')
  const [frozen, setFrozen] = useState<string | null>(null)

  // Start the rear camera for real documents.
  useEffect(() => {
    if (sample || !navigator.mediaDevices) return
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play()
        }
        setCamera('live')
      })
      .catch(() => setCamera('unavailable'))
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [sample])

  const extract = async (file?: Blob) => {
    setPhase('reading')
    track('document_captured', { real: !sample, keepPhoto: privacy.keepPhoto })
    const result = await api.extractDocument({ personId: 'elena', file, sampleId: sample ? SAMPLE_DOC.id : undefined, keepPhoto: privacy.keepPhoto })
    // Privacy default: drop our only copy of the photo once the details are read.
    if (!privacy.keepPhoto && frozen) URL.revokeObjectURL(frozen)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    startReview(result, !sample)
    navigate('/scan/review', { replace: true })
  }

  const shutter = () => {
    if (sample) return void extract()
    const video = videoRef.current
    if (camera === 'live' && video && video.videoWidth) {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        setFrozen(URL.createObjectURL(blob))
        void extract(blob)
      }, 'image/jpeg', 0.9)
    } else captureInput.current?.click()
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFrozen(URL.createObjectURL(file))
    void extract(file)
  }

  const chipText = [privacy.sharedWithLuca ? 'Only you and Luca' : 'Only you', privacy.keepPhoto ? 'photo kept' : 'photo deleted after review'].join(' · ')

  return (
    <Page tabs={false} dark>
      <div className="scanner">
        <div className="scanner__feed">
          {sample && <img className="scanner__sample" src={SAMPLE_DOC.src} alt="Sample pharmacy handout for Levothyroxine 50 mcg" />}
          {!sample && <video ref={videoRef} className="scanner__video" playsInline muted autoPlay style={{ opacity: camera === 'live' && !frozen ? 1 : 0 }} />}
          {frozen && <img className="scanner__frozen" src={frozen} alt="Captured page" />}
          {!sample && camera !== 'live' && !frozen && (
            <div className="scanner__placeholder">
              <span>{camera === 'starting' ? 'Starting camera…' : 'Tap the shutter to take a photo of the page'}</span>
            </div>
          )}
          <svg className="scanner__brackets" width="280" height="360" viewBox="0 0 280 360" fill="none" aria-hidden>
            <path d="M2 42V2h40M238 2h40v40M278 318v40h-40M42 358H2v-40" stroke="var(--mint-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="scanner__top">
          <div className="scanner__bar">
            <button type="button" className="scanner__round" aria-label="Close scanner" onClick={() => navigate(-1)}>
              <X size={18} strokeWidth={2.2} />
            </button>
            <span className="scanner__title">Scanning for Elena</span>
            <span className="scanner__round" aria-hidden>
              <Zap size={17} strokeWidth={2} />
            </span>
          </div>
          <span className="scanner__pill">Fit the whole page inside the frame</span>
        </div>

        {phase === 'aiming' ? (
          <span className="scanner__found">
            <Check size={14} strokeWidth={2.6} />
            {sample || camera === 'live' ? 'Page found · hold still' : 'Ready when you are'}
          </span>
        ) : (
          <span className="scanner__found scanner__found--reading">
            <Sparkles size={14} strokeWidth={2.4} />
            Reading the page…
          </span>
        )}

        <span className="scanner__privacy">
          <Lock size={14} strokeWidth={2.2} />
          {chipText}
        </span>

        <div className="scanner__controls">
          <button type="button" className="scanner__round scanner__round--lg" aria-label="Upload a photo" onClick={() => libraryInput.current?.click()} disabled={sample || phase === 'reading'}>
            <ImageIcon size={22} strokeWidth={2} />
          </button>
          <button type="button" className="scanner__shutter" aria-label={sample ? 'Scan the sample document' : 'Take photo'} onClick={shutter} disabled={phase === 'reading'}>
            <span />
          </button>
          <span className="scanner__done">Done</span>
        </div>

        <input ref={captureInput} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        <input ref={libraryInput} type="file" accept="image/*,application/pdf" hidden onChange={onFile} />
      </div>
    </Page>
  )
}
