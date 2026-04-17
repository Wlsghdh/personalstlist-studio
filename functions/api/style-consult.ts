interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  height: number
  weight: number
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (!env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY가 설정되지 않았습니다.' },
      { status: 500, headers: corsHeaders }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: '요청 형식이 올바르지 않습니다.' },
      { status: 400, headers: corsHeaders }
    )
  }

  const { photo, height, weight } = body
  if (!height || !weight) {
    return Response.json(
      { error: '키와 몸무게를 입력해주세요.' },
      { status: 400, headers: corsHeaders }
    )
  }

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)

  const messages: object[] = [
    {
      role: 'system',
      content: `당신은 전문 퍼스널 스타일리스트입니다. 사용자의 신체 정보와 사진을 바탕으로 맞춤형 스타일 컨설팅 보고서를 한국어로 작성합니다. 보고서는 다음 섹션으로 구성하세요:

1. 체형 분석
2. 퍼스널 컬러 추천 (사진 기반)
3. 추천 스타일 & 핏
4. 피해야 할 스타일
5. 오늘의 코디 추천 (TOP 3)

각 섹션을 명확하게 구분하고, 실용적이고 구체적인 조언을 제공하세요.`,
    },
    {
      role: 'user',
      content: [
        ...(photo
          ? [
              {
                type: 'image_url',
                image_url: { url: photo, detail: 'low' },
              },
            ]
          : []),
        {
          type: 'text',
          text: `키: ${height}cm, 몸무게: ${weight}kg, BMI: ${bmi}\n\n위 정보를 바탕으로 퍼스널 스타일 컨설팅 보고서를 작성해주세요.`,
        },
      ],
    },
  ]

  const model = photo ? 'gpt-4o' : 'gpt-4o-mini'

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })

  if (!openaiRes.ok) {
    const err = await openaiRes.text()
    return Response.json(
      { error: `OpenAI 오류: ${err}` },
      { status: 502, headers: corsHeaders }
    )
  }

  const data = await openaiRes.json() as { choices: { message: { content: string } }[] }
  const report = data.choices[0]?.message?.content ?? '보고서를 생성할 수 없습니다.'

  return Response.json({ report }, { headers: corsHeaders })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
