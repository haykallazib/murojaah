import { useCallback, useEffect, useRef } from 'react'
import { useMurojaahStore } from '../store/useMurojaahStore.js'

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null
const SUPPORTED_LANGUAGES = ['ar-SA', 'ar-EG', 'ar-AE']

function stopRecognition(recognition) {
  if (!recognition) return
  recognition.onresult = null
  recognition.onerror = null
  recognition.onend = null
  try {
    recognition.stop()
  } catch (error) {
    if (error.name !== 'InvalidStateError') throw error
  }
}

export function useSpeechRecognition() {
  const recognitionRef = useRef(null)
  const requestIdRef = useRef(0)
  const finalizeTimerRef = useRef(null)
  const restartTimerRef = useRef(null)
  const store = useMurojaahStore

  const stopListening = useCallback(() => {
    requestIdRef.current += 1
    clearTimeout(finalizeTimerRef.current)
    clearTimeout(restartTimerRef.current)
    const recognition = recognitionRef.current
    recognitionRef.current = null
    stopRecognition(recognition)
    if (store.getState().state === 'LISTENING') store.getState().setState('REQUEST_MIC')
  }, [store])

  const startListening = useCallback(async () => {
    if (store.getState().state !== 'REQUEST_MIC') return
    const requestId = ++requestIdRef.current
    if (!window.isSecureContext) {
      store.getState().setError('Akses mikrofon hanya tersedia di koneksi HTTPS atau localhost.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      store.getState().setError('Browser ini tidak mendukung akses mikrofon. Coba Chrome atau Edge versi terbaru.')
      return
    }
    if (!SpeechRecognition) {
      store.getState().setError('Pengenalan suara tidak tersedia di browser ini. Coba Chrome atau Edge.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      const message = error.name === 'NotAllowedError'
        ? 'Izin mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser lalu coba lagi.'
        : error.name === 'NotFoundError'
          ? 'Mikrofon tidak ditemukan. Sambungkan mikrofon lalu coba lagi.'
          : `Mikrofon tidak dapat diakses: ${error.message}`
      store.getState().setError(message)
      return
    }

    if (requestId !== requestIdRef.current || store.getState().state !== 'REQUEST_MIC') return
    store.getState().setTranscript('')

    const startRecognition = (languageIndex = 0) => {
      if (requestId !== requestIdRef.current) return
      const state = store.getState().state
      if (state !== 'LISTENING' && state !== 'CORRECT') return

      const recognition = new SpeechRecognition()
      recognition.lang = SUPPORTED_LANGUAGES[languageIndex]
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognitionRef.current = recognition
      let finalTranscript = ''
      let interimTranscript = ''
      let nextLanguageIndex = languageIndex

      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition || store.getState().state !== 'LISTENING') return
        interimTranscript = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index]
          if (result.isFinal) finalTranscript += `${result[0].transcript} `
          else interimTranscript += result[0].transcript
        }

        const transcript = `${finalTranscript}${interimTranscript}`.trim()
        store.getState().setTranscript(transcript)

        if (finalTranscript.trim()) {
          clearTimeout(finalizeTimerRef.current)
          finalizeTimerRef.current = setTimeout(() => {
            if (recognitionRef.current !== recognition || store.getState().state !== 'LISTENING') return
            const spoken = finalTranscript.trim()
            finalTranscript = ''
            interimTranscript = ''
            store.getState().evaluateTranscript(spoken)
            const nextState = store.getState().state
            if (nextState === 'WRONG' || nextState === 'FINISHED') {
              recognitionRef.current = null
              stopRecognition(recognition)
            }
          }, 1100)
        }
      }

      recognition.onerror = (event) => {
        if (event.error === 'aborted') return
        if (event.error === 'no-speech') return

        if (event.error === 'network' && languageIndex < SUPPORTED_LANGUAGES.length - 1) {
          nextLanguageIndex = languageIndex + 1
          try {
            recognition.stop()
          } catch (error) {
            if (error.name !== 'InvalidStateError') throw error
          }
          return
        }

        const message = event.error === 'not-allowed'
          ? 'Izin mikrofon tidak diberikan oleh browser.'
          : event.error === 'network'
            ? 'Layanan pengenalan suara tidak dapat diakses. Periksa koneksi internet lalu coba lagi.'
            : `Pengenalan suara gagal: ${event.error}`
        clearTimeout(finalizeTimerRef.current)
        recognitionRef.current = null
        stopRecognition(recognition)
        store.getState().setError(message)
      }

      recognition.onend = () => {
        if (recognitionRef.current !== recognition || requestId !== requestIdRef.current) return
        recognitionRef.current = null
        clearTimeout(finalizeTimerRef.current)

        if (finalTranscript.trim() && store.getState().state === 'LISTENING') {
          store.getState().evaluateTranscript(finalTranscript.trim())
        }

        const stateAfterEnd = store.getState().state
        if (stateAfterEnd === 'WRONG' || stateAfterEnd === 'FINISHED' || stateAfterEnd === 'REQUEST_MIC') return

        restartTimerRef.current = setTimeout(() => {
          startRecognition(nextLanguageIndex)
        }, 250)
      }

      try {
        recognition.start()
        if (store.getState().state === 'REQUEST_MIC') store.getState().setState('LISTENING')
      } catch (error) {
        if (requestId !== requestIdRef.current) return
        recognitionRef.current = null
        store.getState().setError(`Pengenalan suara tidak dapat dimulai: ${error.message}`)
      }
    }

    store.getState().setState('LISTENING')
    startRecognition()
  }, [store])

  useEffect(() => () => stopListening(), [stopListening])
  return { startListening, stopListening, supported: Boolean(SpeechRecognition) }
}
