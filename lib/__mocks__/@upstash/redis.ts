export class Redis {
  constructor() {}
  
  get = jest.fn()
  set = jest.fn()
  del = jest.fn()
  incr = jest.fn()
}