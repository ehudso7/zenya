export class Ratelimit {
  static slidingWindow = jest.fn()
  
  constructor() {}
  
  limit = jest.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  })
}