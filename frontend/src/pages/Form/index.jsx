import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import ProgressBar from '../../components/ProgressBar'
import { Toast, useToast } from '../../components/Toast'
import { candidateApi } from '../../api/client'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'

const TOTAL_STEPS = 4

// Обязательные поля для каждого шага
const REQUIRED = {
  1: ['first_name', 'last_name', 'age', 'city', 'school'],
  2: ['motivation', 'future'],
  3: ['achievement', 'problem'],
  4: ['essay'],
}

export default function Form() {
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [step, setStep]       = useState(1)
  const [data, setData]       = useState({})
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isNew, setIsNew]     = useState(true)  // создать или обновить

  // Загружаем существующую анкету если есть
  useEffect(() => {
    candidateApi.get()
      .then(({ data }) => {
        setData(data)
        setIsNew(false)
        // Если уже отправлена — в кабинет
        if (['scoring', 'scored', 'shortlisted', 'rejected'].includes(data.status)) {
          navigate('/cabinet')
        }
      })
      .catch(() => setIsNew(true))
  }, [])

  function handleChange(field, value) {
    setData(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate(stepNum) {
    const required = REQUIRED[stepNum] || []
    const errs = {}
    required.forEach(field => {
      if (!data[field] || String(data[field]).trim() === '') {
        errs[field] = 'Обязательное поле'
      }
    })
    if (stepNum === 1 && data.age && (data.age < 14 || data.age > 30)) {
      errs.age = 'Возраст от 14 до 30 лет'
    }
    return errs
  }

  async function saveStep() {
    setSaving(true)
    try {
      const payload = { ...data }
      delete payload.essay_file  // файл отдельно

      if (isNew) {
        await candidateApi.create(payload)
        setIsNew(false)
      } else {
        await candidateApi.update(payload)
      }

      // Загружаем файл эссе если есть
      if (data.essay_file instanceof File) {
        const formData = new FormData()
        formData.append('essay_file', data.essay_file)
        await candidateApi.update(formData)
      }
    } catch (err) {
      const serverErrors = err.response?.data || {}
      setErrors(serverErrors)
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    const errs = validate(step)
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await saveStep()
      showToast('Сохранено ✓')
      setStep(s => s + 1)
      window.scrollTo(0, 0)
    } catch {
      showToast('Ошибка сохранения', 'error')
    }
  }

  function handleBack() {
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  async function handleSubmit() {
    const errs = validate(4)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      await saveStep()
      await candidateApi.submit()
      showToast('Заявка отправлена! Переходим в кабинет...')
      setTimeout(() => navigate('/cabinet'), 1500)
    } catch (err) {
      const msg = err.response?.data?.error || 'Ошибка отправки'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const stepProps = { data, onChange: handleChange, errors }

  return (
    <div>
      <Navbar />
      <Toast toast={toast} />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <ProgressBar current={step} total={TOTAL_STEPS} />

        <div className="card" style={{ marginBottom: 20 }}>
          {step === 1 && <Step1 {...stepProps} />}
          {step === 2 && <Step2 {...stepProps} />}
          {step === 3 && <Step3 {...stepProps} />}
          {step === 4 && <Step4 {...stepProps} />}
        </div>

        {/* Кнопки навигации */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <button
            className="btn-secondary"
            onClick={handleBack}
            disabled={step === 1}
            style={{ flex: 1, padding: '12px' }}
          >
            ← Назад
          </button>

          {step < TOTAL_STEPS ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={saving}
              style={{ flex: 2, padding: '12px' }}
            >
              {saving ? 'Сохраняем...' : 'Далее →'}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 2, padding: '12px', background: 'var(--green)' }}
            >
              {submitting ? 'Отправляем...' : 'Отправить заявку →'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Прогресс сохраняется автоматически при переходе между шагами
        </p>
      </div>
    </div>
  )
}
