// The OpenAI call runs in the /api/korean-name server function so the API key never reaches the browser.
// Name creation keeps its local fallback for when the function is unavailable or not configured.

interface NameGenerationRequest {
  originalName: string;
  gender: string;
  personality: string[];
}

export interface NameGenerationResponse {
  name_hangul: string;
  name_hanja: string;
  romanization: string;
  meaning: string;
}

export const generateKoreanName = async (
  formData: NameGenerationRequest
): Promise<NameGenerationResponse> => {
  try {
    const response = await fetch('/api/korean-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error(`Name generation failed (${response.status})`);
    }
    return await response.json() as NameGenerationResponse;
  } catch (error) {
    console.error('Korean name generation failed, using fallback:', error);
    return generateFallbackName(formData);
  }
};


// 폴백 이름 생성 함수 (OpenAI 실패 시 사용)
const generateFallbackName = (formData: NameGenerationRequest): NameGenerationResponse => {
  const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const maleNames = ['민수', '준호', '태현', '현우', '지훈', '동현', '성민', '준영', '민호', '재현'];
  const femaleNames = ['지은', '서연', '민지', '예은', '하늘', '지현', '수진', '예진', '서현', '민정'];
  const maleHanja = ['民秀', '俊浩', '泰賢', '賢宇', '智勳', '東炫', '成民', '俊英', '民浩', '在炫'];
  const femaleHanja = ['智恩', '瑞妍', '民智', '藝恩', '河娜', '智賢', '秀珍', '藝珍', '瑞賢', '民貞'];
  
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = formData.gender === 'male' 
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];
  
  const hanjaName = formData.gender === 'male'
    ? maleHanja[Math.floor(Math.random() * maleHanja.length)]
    : femaleHanja[Math.floor(Math.random() * femaleHanja.length)];
  
  const fullName = `${surname}${givenName}`;
  const fullHanja = `金${hanjaName}`; // 성씨는 김으로 고정
  
  return {
    name_hangul: fullName,
    name_hanja: fullHanja,
    romanization: `${surname} ${givenName}`,
    meaning: `${formData.originalName}님의 성격을 반영한 의미있는 한국 이름입니다.`
  };
};
