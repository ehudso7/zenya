import { NextRequest } from 'next/server'
import { z } from 'zod'
import { validateRequest } from './validation-middleware'

describe('validateRequest', () => {
  const mockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest
  }

  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
    email: z.string().email(),
  })

  describe('Successful validation', () => {
    it('should validate and return parsed data', async () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      }

      const request = mockRequest(validData)
      const result = await validateRequest(request, testSchema)

      expect(result.data).toEqual(validData)
      expect(result.error).toBeNull()
    })

    it('should handle empty schema', async () => {
      const emptySchema = z.object({})
      const request = mockRequest({ any: 'data' })
      
      const result = await validateRequest(request, emptySchema)

      expect(result.data).toEqual({})
      expect(result.error).toBeNull()
    })

    it('should coerce types when possible', async () => {
      const coerceSchema = z.object({
        count: z.coerce.number(),
        active: z.coerce.boolean(),
      })

      const request = mockRequest({
        count: '42',
        active: 'true',
      })

      const result = await validateRequest(request, coerceSchema)

      expect(result.data).toEqual({
        count: 42,
        active: true,
      })
    })
  })

  describe('Validation errors', () => {
    it('should return error for invalid data', async () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'not-an-email',
      }

      const request = mockRequest(invalidData)
      const result = await validateRequest(request, testSchema)

      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()
      expect(result.error?.status).toBe(400)
    })

    it('should return detailed error messages', async () => {
      const request = mockRequest({
        name: '',
        age: 'not-a-number',
        email: 'invalid',
      })

      const result = await validateRequest(request, testSchema)
      const errorBody = await result.error?.json()

      expect(errorBody.error).toBe('Validation error')
      expect(errorBody.details).toHaveLength(3)
      expect(errorBody.details).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.any(String),
        })
      )
    })

    it('should handle missing required fields', async () => {
      const request = mockRequest({})
      const result = await validateRequest(request, testSchema)

      expect(result.error).toBeDefined()
      const errorBody = await result.error?.json()
      expect(errorBody.details).toHaveLength(3)
    })

    it('should handle extra fields', async () => {
      const strictSchema = testSchema.strict()
      const request = mockRequest({
        name: 'John',
        age: 30,
        email: 'john@example.com',
        extra: 'field',
      })

      const result = await validateRequest(request, strictSchema)
      expect(result.error).toBeDefined()
    })
  })

  describe('Request parsing errors', () => {
    it('should handle JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest

      const result = await validateRequest(request, testSchema)

      expect(result.error).toBeDefined()
      expect(result.error?.status).toBe(400)
      const errorBody = await result.error?.json()
      expect(errorBody.error).toBe('Invalid request body')
    })

    it('should handle empty body', async () => {
      const request = {
        json: jest.fn().mockResolvedValue(null),
      } as unknown as NextRequest

      const result = await validateRequest(request, testSchema)

      expect(result.error).toBeDefined()
      const errorBody = await result.error?.json()
      expect(errorBody.error).toBe('Validation error')
    })
  })

  describe('Complex schemas', () => {
    it('should validate nested objects', async () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          profile: z.object({
            bio: z.string().optional(),
            age: z.number(),
          }),
        }),
      })

      const validData = {
        user: {
          name: 'John',
          profile: {
            age: 30,
          },
        },
      }

      const request = mockRequest(validData)
      const result = await validateRequest(request, nestedSchema)

      expect(result.data).toEqual(validData)
    })

    it('should validate arrays', async () => {
      const arraySchema = z.object({
        tags: z.array(z.string()).min(1).max(5),
        scores: z.array(z.number()).optional(),
      })

      const validData = {
        tags: ['javascript', 'typescript'],
        scores: [95, 87, 92],
      }

      const request = mockRequest(validData)
      const result = await validateRequest(request, arraySchema)

      expect(result.data).toEqual(validData)
    })

    it('should validate unions', async () => {
      const unionSchema = z.object({
        status: z.union([
          z.literal('active'),
          z.literal('inactive'),
          z.literal('pending'),
        ]),
      })

      const request = mockRequest({ status: 'active' })
      const result = await validateRequest(request, unionSchema)

      expect(result.data).toEqual({ status: 'active' })
    })
  })

  describe('Custom error messages', () => {
    it('should use custom error messages from schema', async () => {
      const customSchema = z.object({
        username: z.string().min(3, 'Username too short').max(20, 'Username too long'),
        password: z.string().regex(/[A-Z]/, 'Must contain uppercase'),
      })

      const request = mockRequest({
        username: 'ab',
        password: 'noupppercase',
      })

      const result = await validateRequest(request, customSchema)
      const errorBody = await result.error?.json()

      expect(errorBody.details).toContainEqual(
        expect.objectContaining({
          field: 'username',
          message: 'Username too short',
        })
      )
    })
  })
})