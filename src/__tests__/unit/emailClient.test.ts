import { sendDonationConfirmationEmail } from '@/lib/emailClient'

// Mock fetch for Brevo API calls
global.fetch = jest.fn()

describe('Email Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendDonationConfirmationEmail', () => {
    const validEmailData = {
      email: 'donor@example.com',
      name: 'John Doe',
      amount: 100,
      frequency: 'once' as const,
    }

    it('should send email successfully without PDF', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail(validEmailData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': expect.any(String),
          },
        })
      )

      const callArgs = mockFetch.mock.calls[0][1]
      const bodyData = JSON.parse(callArgs.body)

      expect(bodyData.to).toEqual([
        { email: 'donor@example.com', name: 'John Doe' },
      ])
      expect(bodyData.subject).toContain('don')
      expect(bodyData.htmlContent).toContain('John Doe')
      expect(bodyData.htmlContent).toContain('100')
    })

    it('should send email with PDF attachment', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      const pdfBuffer = Buffer.from('fake pdf content')

      await sendDonationConfirmationEmail({
        ...validEmailData,
        pdfBuffer,
        donationDate: new Date('2024-01-15'),
        transactionId: 'txn_123',
      })

      expect(mockFetch).toHaveBeenCalled()

      const callArgs = mockFetch.mock.calls[0][1]
      const bodyData = JSON.parse(callArgs.body)

      expect(bodyData.attachment).toBeDefined()
      expect(bodyData.attachment).toHaveLength(1)
      expect(bodyData.attachment[0].name).toContain('.pdf')
      expect(bodyData.attachment[0].content).toBeDefined()
    })

    it('should include correct sender information', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail(validEmailData)

      const callArgs = mockFetch.mock.calls[0][1]
      const bodyData = JSON.parse(callArgs.body)

      expect(bodyData.sender).toBeDefined()
      expect(bodyData.sender.email).toContain('@')
      expect(bodyData.sender.name).toContain('Kenomi')
    })

    it('should format amount correctly in email', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail({
        ...validEmailData,
        amount: 150.50,
      })

      const callArgs = mockFetch.mock.calls[0][1]
      const bodyData = JSON.parse(callArgs.body)

      expect(bodyData.htmlContent).toContain('150')
    })

    it('should differentiate between one-time and monthly donations', async () => {
      const mockFetch = global.fetch as jest.Mock

      // Test one-time
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail({
        ...validEmailData,
        frequency: 'once',
      })

      let callArgs = mockFetch.mock.calls[0][1]
      let bodyData = JSON.parse(callArgs.body)

      expect(bodyData.htmlContent).toContain('unique')

      // Test monthly
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_124' }),
      })

      await sendDonationConfirmationEmail({
        ...validEmailData,
        frequency: 'monthly',
      })

      callArgs = mockFetch.mock.calls[1][1]
      bodyData = JSON.parse(callArgs.body)

      expect(bodyData.htmlContent).toContain('mensuel')
    })

    it('should throw error when API call fails', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(sendDonationConfirmationEmail(validEmailData)).rejects.toThrow()
    })

    it('should throw error on network failure', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(sendDonationConfirmationEmail(validEmailData)).rejects.toThrow('Network error')
    })

    it('should use correct Brevo API key from env', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail(validEmailData)

      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs.headers['api-key']).toBe('xkeysib-test')
    })

    it('should sanitize HTML in email content', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail({
        ...validEmailData,
        name: '<script>alert("xss")</script>John',
      })

      const callArgs = mockFetch.mock.calls[0][1]
      const bodyData = JSON.parse(callArgs.body)

      // Should escape or remove script tags
      expect(bodyData.htmlContent).not.toContain('<script>')
    })

    it('should handle missing optional fields gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: 'msg_123' }),
      })

      await sendDonationConfirmationEmail({
        email: 'donor@example.com',
        name: 'John Doe',
        amount: 100,
        frequency: 'once',
        // No donationDate or transactionId
      })

      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
