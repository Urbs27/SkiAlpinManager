const nodemailer = {
    createTestAccount: jest.fn().mockResolvedValue({
        user: 'testuser',
        pass: 'testpass'
    }),
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({
            messageId: 'testmessageid'
        })
    })
};

module.exports = nodemailer; 