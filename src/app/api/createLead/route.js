export async function POST(req) {
  try {
    // Извлекаем все поля из запроса
    const {
      name,
      phone,
      travelDate,
      nights,
      nightsOther,
      adults,
      adultsOther,
      children,
      childrenOther,
    } = await req.json();

    if (!name || !phone) {
      return new Response(
        JSON.stringify({ error: 'Имя и телефон обязательны' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const key = process.env.UON_API_KEY || 'LPbMe4y04ZO27b8P8Mra';
    const url = `https://api.u-on.ru/${key}/lead/create.json`;

    // Формируем дополнительные данные (u_note) в «декодированном» виде:
    let noteValue = '';
    if (travelDate) {
      const formattedDate = new Date(travelDate).toLocaleString('ru-RU');
      noteValue += `Дата поездки: ${formattedDate}\n`;
    }
    if (nights) noteValue += `Ночей: ${nights}\n`;
    if (nightsOther) noteValue += `Ночей (другое): ${nightsOther}\n`;
    if (adults) noteValue += `Взрослых: ${adults}\n`;
    if (adultsOther) noteValue += `Взрослых (другое): ${adultsOther}\n`;
    if (children) noteValue += `Детей: ${children}\n`;
    if (childrenOther) noteValue += `Детей (другое): ${childrenOther}\n`;
    if (!noteValue) {
      noteValue = 'Дефолтное значение u_note';
    }

    // Собираем строку вручную без автоматического кодирования
    // Здесь пробелы и переводы строк остаются как есть
    const rawPayload = `source=Квиз с сайта&u_name=${name}&u_phone=${phone}&u_note=${noteValue}`;

    console.log('Raw payload to send:', rawPayload);

    // Отправляем запрос с Content-Type, как обычно
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawPayload,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Обращение создано:', data);
      return new Response(
        JSON.stringify({ message: 'Lead created successfully', data }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      const errorText = await response.text();
      console.error('Ошибка создания обращения:', errorText);
      return new Response(
        JSON.stringify({ error: errorText }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
