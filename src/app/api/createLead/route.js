export async function POST(req) {
  try {
    // Извлекаем поля из запроса
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

    // Собираем дополнительные данные в поле u_note
    const noteParts = [];
    if (travelDate) {
      const formattedDate = new Date(travelDate).toLocaleString('ru-RU');
      noteParts.push(`Дата поездки: ${formattedDate}`);
    }
    if (nights) noteParts.push(`Ночей: ${nights}`);
    if (nightsOther) noteParts.push(`Ночей (другое): ${nightsOther}`);
    if (adults) noteParts.push(`Взрослых: ${adults}`);
    if (adultsOther) noteParts.push(`Взрослых (другое): ${adultsOther}`);
    if (children) noteParts.push(`Детей: ${children}`);
    if (childrenOther) noteParts.push(`Детей (другое): ${childrenOther}`);
    
    const u_note = noteParts.length > 0 
      ? noteParts.join('\n') 
      : 'Дефолтное значение u_note';

    // Формируем объект payload для JSON
    const payload = {
      key: key,
      _format: 'json',
      source: 'Квиз с сайта',
      u_name: name,
      u_phone: phone,
      u_note: u_note,
    };

    console.log('JSON payload to send:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
