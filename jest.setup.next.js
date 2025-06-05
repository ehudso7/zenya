// Mock Next.js server components for all tests
global.NextRequest = class NextRequest {
  constructor(url, init) {
    this.url = url
    this.headers = init?.headers || new Map()
    this.method = init?.method || 'GET'
  }
}

global.NextResponse = class NextResponse {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
  
  static json(data, init) {
    return {
      body: data,
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
      json: async () => data,
    }
  }
}

// Add to global
global.Request = global.NextRequest
global.Response = global.NextResponse