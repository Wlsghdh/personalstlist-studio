interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string | null
  height: number
  weight: number
}

interface OutputItem {
  type: string
  role?: string
  content?: { type: string; text: string }[]
}

interface ResponsesApiResult {
  output: OutputItem[]
  error?: { message: string }
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

  const userContent: object[] = [
    ...(photo
      ? [{ type: 'input_image', image_url: photo }]
      : []),
    {
      type: 'input_text',
      text: `키 ${height}cm, 몸무게 ${weight}kg, BMI ${bmi}\n위 정보를 바탕으로 퍼스널 스타일 컨설팅 보고서를 작성해주세요.`,
    },
  ]

  const openaiRes = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'o4-mini',
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text: '당신은 전문 퍼스널 스타일리스트입니다. 사용자의 사진과 신체 정보를 분석하여 맞춤형 스타일 컨설팅 보고서를 작성해주세요. 보고서에는 다음 내용을 포함해주세요.\n체형분석\n퍼스널 컬러 추천\n어울리는 스타일 및 패션 아이템 추천\n피해야 할 스타일\n코디 팁\n친절하고 전문적인 톤으로 작성해주세요.',
            },
          ],
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      text: {
        format: { type: 'text' },
      },
      reasoning: {
        effort: 'medium',
        summary: 'auto',
      },
      store: true,
    }),
  })

  if (!openaiRes.ok) {
    const err = await openaiRes.text()
    return Response.json(
      { error: `OpenAI 오류: ${err}` },
      { status: 502, headers: corsHeaders }
    )
  }

  const data = await openaiRes.json() as ResponsesApiResult

  if (data.error) {
    return Response.json(
      { error: data.error.message },
      { status: 502, headers: corsHeaders }
    )
  }

  const messageItem = data.output.find(
    (item) => item.type === 'message' && item.role === 'assistant'
  )
  const report =
    messageItem?.content?.find((c) => c.type === 'output_text')?.text
    ?? '보고서를 생성할 수 없습니다.'

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
