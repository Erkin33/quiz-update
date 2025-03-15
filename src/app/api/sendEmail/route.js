export async function POST(req) {
    try {
      const { formData } = await req.json();
      const key = process.env.UON_API_KEY; // Например, LPbMe4y04ZO27b8P8Mra
      const url = `https://api.u-on.ru/${key}/mail/create.json`;
  
      // Формируем обязательные параметры согласно документации API
      const payload = {
        key: key,
        _format: 'json',
        email_to: 'andfeoktistov@mail.ru,pegas.tomsk@mail.ru',
        email_from: process.env.UON_SMTP_FROM || 'no-reply@travel.tomsk.ru',
        subject: 'Результаты квиза',
        text: `Результаты квиза:\n${JSON.stringify(formData, null, 2)}`,
        // datetime можно не указывать (по умолчанию текущие дата и время)
      };
  
      console.log('Sending payload:', payload); // Логирование для отладки
  
      // Преобразуем объект в URL-encoded строку
      const body = new URLSearchParams(payload);
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
  
      if (response.ok) {
        return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: errorText }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  