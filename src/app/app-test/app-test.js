const crypto = require('crypto');
const { serverGenerateKey, serverValidateUser } = require('../server-test/server-test');

async function setPublicKey(publicKeyBase64) {
    try {
        const public_key = Buffer.from(publicKeyBase64).toString('base64');
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${public_key}\n-----END PUBLIC KEY-----`;
        return publicKeyPem;
    } catch (error) {
        throw error;
    }
}

async function encryptData(public_key, message) {
    try {
        const  encrypted = crypto.publicEncrypt(public_key, JSON.stringify(message));
        return encrypted;
    } catch (error) {
        throw error;
    }
}

(async () => {
    const message = {
        user: 'jorge',
        password: 'prueba123'
    };
    try {
        const keys = await serverGenerateKey();
        const public_key = await setPublicKey(keys.public_key);
        const encrypt_data = await encryptData(public_key, message);
        const decrypt_data = await serverValidateUser(encrypt_data, keys.private_key);
        console.log('resutl', decrypt_data);
    } catch (error) {
        console.log(error);
    }
})();