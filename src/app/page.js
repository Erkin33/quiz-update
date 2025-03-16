'use client';

import React, { useState } from 'react';
import Image from 'next/image';

/* react-phone-input-2 */
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

/* react-datepicker (динамический импорт для отключения SSR) */
import dynamic from 'next/dynamic';
import 'react-datepicker/dist/react-datepicker.css';
const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
registerLocale('ru', ru);

export default function QuizPage() {
  const steps = [
    {
      id: 1,
      type: 'date',
      question: 'Когда планируете поездку?',
      key: 'travelDate',
      hint: 'Выберите примерно в диапазоне дат',
    },
    {
      id: 2,
      type: 'radio',
      question: 'Сколько ночей планируете отдыхать?',
      key: 'nights',
      options: ['до 5 ночей', '6-9 ночей', '9-13 ночей', '14+ ночей', 'Другое…'],
      hint: 'Выберите ваш ответ',
    },
    {
      id: 3,
      type: 'radio',
      question: 'Сколько взрослых едет?',
      key: 'adults',
      options: ['1', '2', '3', '4+', 'Другое…'],
      hint: 'Укажите число взрослых',
    },
    {
      id: 4,
      type: 'radio',
      question: 'Сколько детей едет?',
      key: 'children',
      options: ['0', '1', '2', '3+', 'Другое…'],
      hint: 'Укажите число детей, если есть',
    },
    {
      id: 5,
      type: 'contact',
      question: 'Заполните форму и получите подборку лучших туров',
      hint: 'Укажите телефон и имя, чтобы мы могли связаться с вами',
    },
    {
      id: 6,
      type: 'final',
      question: 'Спасибо!',
    },
  ];

  // Ставим галочку по умолчанию
  const [formData, setFormData] = useState({
    travelDate: null,
    nights: '',
    nightsOther: '',
    adults: '',
    adultsOther: '',
    children: '',
    childrenOther: '',
    phone: '',
    name: '',
    agreement: true,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const current = steps[currentStep];
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  const validateStep = () => {
    if (current.type === 'date' && !formData.travelDate) return false;
    if (current.type === 'radio' && !formData[current.key]) return false;
    if (current.type === 'contact') {
      if (!formData.phone || !formData.name || !formData.agreement) return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRadioSelect = (stepKey, option) => {
    setFormData(prev => ({
      ...prev,
      [stepKey]: option === 'Другое…' ? 'other' : option,
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({ ...prev, travelDate: date }));
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      const leadRes = await fetch('/api/createLead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const leadData = await leadRes.json();
      console.log('Lead response:', leadData);

      const emailRes = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });
      if (emailRes.ok) {
        setCurrentStep(prev => prev + 1);
      } else {
        const data = await emailRes.json();
        console.error('Ошибка отправки email:', data.error);
      }
    } catch (error) {
      console.error('Ошибка:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Основной контейнер */}
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 relative flex flex-col justify-center overflow-hidden pb-16">

        {/* Блок менеджера + фон */}
        {current.type !== 'final' && (
          <div className="flex flex-col items-start mb-6 p-4 bg-[#ededed] rounded-[30px]">
            <div className="flex items-center mb-3">
              <div className="relative mr-3">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image src="/avatar.png" alt="Avatar" width={64} height={64} />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">Екатерина</p>
                <p className="text-sm text-gray-500">Посетила 45 стран</p>
              </div>
            </div>
            {/* Подсказка */}
            {current.hint && (
              <p className="text-sm text-[#000000]">
                {current.hint}
              </p>
            )}
          </div>
        )}

        {/* Заголовок вопроса (по левому краю) */}
        {current.type !== 'final' && (
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-left">
            {current.question}
          </h2>
        )}

        {/* Календарь */}
        {current.type === 'date' && (
          <div className="flex justify-center mb-8">
            <DatePicker
              inline
              selected={formData.travelDate}
              onChange={handleDateSelect}
              minDate={new Date()}
              locale="ru"
              dateFormat="dd MMMM yyyy"
            />
          </div>
        )}

        {/* Радио */}
        {current.type === 'radio' && (
          <div className="mb-8">
            {current.options.map((option, idx) => {
              const isOther = option === 'Другое…';
              const checked =
                formData[current.key] === option ||
                (isOther && formData[current.key] === 'other');
              return (
                <div key={idx} className="mb-4">
                  <label className="flex items-center border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      className="mr-3"
                      name={current.key}
                      checked={checked}
                      onChange={() => handleRadioSelect(current.key, option)}
                    />
                    <span className="text-lg">{option}</span>
                  </label>
                  {isOther && checked && (
                    <div className="mt-2 ml-6">
                      <input
                        type="text"
                        placeholder="Уточните..."
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#60b822]"
                        value={formData[`${current.key}Other`] || ''}
                        onChange={(e) =>
                          handleChange(`${current.key}Other`, e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Контактные данные */}
        {current.type === 'contact' && (
          <div className="mb-8">
            <p className="text-gray-600 text-lg mb-6">
              Изучив ваши критерии, мы отправим вам подборку лучших туров в течение часа!
            </p>
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-2">Телефон</label>
              <PhoneInput
                country={'ru'}
                value={formData.phone}
                onChange={(phone) => handleChange('phone', phone)}
                placeholder="Номер телефона"
                containerClass="relative w-full"
                inputClass="pl-16 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-[#60b822]"
                buttonClass="absolute left-2 top-2 bg-transparent border-0"
                dropdownClass="bg-white border border-gray-300 rounded-md shadow mt-1"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-2">Ваше имя</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#60b822]"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="mb-6 flex items-center space-x-3">
              <input
                type="checkbox"
                className="w-5 h-5 text-[#60b822] focus:ring-[#60b822]"
                checked={formData.agreement}
                onChange={(e) => handleChange('agreement', e.target.checked)}
              />
              <label className="text-sm text-gray-600">
                Согласен на обработку персональных данных
              </label>
            </div>
          </div>
        )}

        {/* Финальный шаг */}
        {current.type === 'final' && (
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Спасибо! 👏</h2>
            <p className="mb-6 text-gray-600 text-lg text-center">
              Мы отправим вам результаты в течение 15 минут.
            </p>
            <div className="flex flex-col items-start space-y-4 mb-6">
              <button
                className="px-6 py-3 rounded-md text-white font-bold mx-auto button-flare"
                style={{ backgroundColor: '#60b822' }}
                onClick={() => (window.location.href = 'https://travel.tomsk.ru/')}
              >
                Посетите наш сайт
              </button>
              <p className="text-gray-500 text-sm mx-auto">
                Или посетите наши соцсети:
              </p>
              <div className="flex space-x-4 items-center justify-center w-full">
                <a
                  href="https://vk.com/pegas_tomsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-transparent border-0"
                >
                  <img src="/icons8Vk.svg" alt="VK" className="w-[60px] h-[60px]" />
                </a>
                <a
                  href="https://t.me/pegas_tomsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-transparent border-0"
                >
                  <img src="/icons8TG.svg" alt="Telegram" className="w-[60px] h-[60px]" />
                </a>
                <a
                  href="https://ok.ru/group/70000007329147"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-transparent border-0"
                >
                  <img src="/icons8OK.svg" alt="OK" className="w-[60px] h-[60px]" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Нижняя панель (если не финальный шаг) */}
        {current.type !== 'final' && (
          <div className="absolute bottom-0 left-0 w-full p-2">
            <div className="flex items-center justify-between">
              {currentStep > 0 ? (
                <button
                  className="px-4 py-2 rounded-md text-white font-semibold flex items-center justify-center button-flare"
                  style={{ backgroundColor: '#60b822' }}
                  onClick={goBack}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 mr-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  
                  <span className="flare"></span>
                </button>
              ) : (
                <div className="w-10 h-10"></div>
              )}

              <div className="flex items-center space-x-2">
                {/* Прогресс-бар со "змейкой" */}
                <div className="progress-bar w-24 sm:w-48">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%`, backgroundColor: '#60b822' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{progress}%</span>
              </div>

              <button
                className="px-4 py-2 rounded-md text-white font-semibold flex items-center justify-center button-flare"
                style={{ backgroundColor: '#60b822' }}
                onClick={current.type === 'contact' ? handleSubmit : goNext}
              >
                Далее
                <span className="flare"></span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
