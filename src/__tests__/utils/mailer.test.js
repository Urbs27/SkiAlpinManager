const mailer = require('../../utils/mailer');
const nodemailer = require('nodemailer');

jest.mock('nodemailer', () => ({
    createTestAccount: jest.fn().mockResolvedValue({
        user: 'testuser',
        pass: 'testpass'
    }),
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
        close: jest.fn()
    })
}));

describe('Mailer Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        if (mailer.transporter) {
            await mailer.transporter.close();
        }
    });

    describe('sendMail', () => {
        test('should send email successfully', async () => {
            const mockTransport = nodemailer.createTransport();

            await mailer.sendMail(
                'test@example.com',
                'Test Subject',
                'Test Content'
            );

            expect(mockTransport.sendMail).toHaveBeenCalledWith({
                from: expect.stringContaining('Ski Alpin Manager'),
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Content'
            });
        });

        test('should handle sending errors', async () => {
            const mockTransport = nodemailer.createTransport();
            mockTransport.sendMail.mockRejectedValueOnce(new Error('Sending failed'));

            await expect(mailer.sendMail(
                'test@example.com',
                'Test Subject',
                'Test Content'
            )).rejects.toThrow('Sending failed');
        });

        test('should handle transporter initialization errors', async () => {
            mailer._setTransporter(null);
            nodemailer.createTestAccount.mockRejectedValueOnce(new Error('Init failed'));

            await expect(mailer.sendMail(
                'test@example.com',
                'Test Subject',
                'Test Content'
            )).rejects.toThrow('Init failed');
        });
    });
});