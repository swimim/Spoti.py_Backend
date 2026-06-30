# API 명세서

기본 서버 주소: `http://localhost:3000`

인증이 필요한 API는 액세스 토큰을 아래 방식으로 전달합니다.

```
Authorization: Bearer {accessToken}
```

## 서버 상태 조회
> API GET /

### REQUEST
```
Header {
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  status: string,
  timestamp: string,
  uptime: string,
  version: string,
  description: string
}
```

## 로그인
> API POST /auth/signin

### REQUEST
```
Header {
  Content-Type: application/json
}

Body {
  userId: string,
  password: string
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  accessToken: string,
  refreshToken: string,
  username: string,
  score: number
}
```

## 액세스 토큰 재발급
> API POST /auth/refresh

### REQUEST
```
Header {
  Cookie: refreshToken={refreshToken}
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  accessToken: string
}
```

## 로그아웃
> API POST /auth/logout

### REQUEST
```
Header {
  Authorization: Bearer {accessToken}
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
}
```

## 구글 로그인 시작
> API GET /auth/google

### REQUEST
```
Header {
}

Body {
}
```

### RESPONSE
```
Header {
  Location: string
}

Body {
}
```

## 구글 로그인 콜백
> API GET /auth/google/redirect

### REQUEST
```
Header {
}

Body {
}
```

### RESPONSE
```
Header {
  Location: myapp://auth/callback?accessToken={accessToken}&refreshToken={refreshToken}
  또는
  Location: {FRONTEND_URL}/auth/callback?accessToken={accessToken}&refreshToken={refreshToken}
}

Body {
}
```

## 회원가입
> API POST /user/signup

### REQUEST
```
Header {
  Content-Type: application/json
}

Body {
  userId: string,
  password: string,
  confirmPassword: string,
  email: string,
  userFirst: string,
  userLast: string
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
}
```

## 내 정보 조회
> API GET /user

### REQUEST
```
Header {
  Authorization: Bearer {accessToken}
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  username: string,
  score: number
}
```

## 설정 조회
> API GET /user/settings

### REQUEST
```
Header {
  Authorization: Bearer {accessToken}
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  sirenNotification: boolean,
  toastNotification: boolean
}
```

## 설정 변경
> API PATCH /user/settings

### REQUEST
```
Header {
  Content-Type: application/json,
  Authorization: Bearer {accessToken}
}

Body {
  sirenNotification?: boolean,
  toastNotification?: boolean
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  sirenNotification: boolean,
  toastNotification: boolean
}
```

## 졸음 위험 알림 구독
> API GET /statistic/notification

### REQUEST
```
Header {
  Authorization: Bearer {accessToken},
  Accept: text/event-stream
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: text/event-stream
}

Body {
  data: {
    success: boolean,
    isDangerous: boolean
  }
}
```

## 졸음 통계 조회
> API GET /statistic/{method}

### REQUEST
```
Header {
  Authorization: Bearer {accessToken}
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  success: boolean,
  data: [
    {
      date: string,
      dayOfWeek?: string,
      drowsinessCount: number,
      option: string[]
    }
  ]
}
```

`method` 값:
- `weekly`: 일요일부터 토요일까지 7일 통계
- `monthly`: 최근 30일 중 상위 9일 통계

## 졸음 통계 저장
> API POST /internal/statistic

### REQUEST
```
Header {
  Content-Type: application/json,
  Authorization: Bearer {accessToken},
  internal-token: {INTERNAL_TOKEN}
}

Body [
  {
    ear_smooth: number,
    status: "OPEN" | "CLOSED" | "YAWNING"
  }
]
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  message: string,
  totalDetections: number
}
```

## 공통 에러 응답
> API 모든 엔드포인트

### REQUEST
```
Header {
}

Body {
}
```

### RESPONSE
```
Header {
  Content-Type: application/json
}

Body {
  statusCode: number,
  message: string | string[],
  error: string
}
```
