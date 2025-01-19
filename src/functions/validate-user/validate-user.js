const AWS = require("aws-sdk");
const crypto = require('crypto');
require('dotenv').config();
AWS.config.update({ region: "us-east-1" });
const kms = new AWS.KMS();
const client = new AWS.DynamoDB.DocumentClient();

async function decryptPrivateKey(privateKeyBase64) {
    try {
        const params = {
            CiphertextBlob: Buffer.from(privateKeyBase64, 'base64'),
            KeyId: process.env.SYMETRIC_KEY_KMS,
            EncryptionAlgorithm: "SYMMETRIC_DEFAULT",
        };
        const decryptedData = await kms.decrypt(params).promise();
        const private_key = Buffer.from(decryptedData.Plaintext).toString('base64');
        const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${private_key}\n-----END PRIVATE KEY-----`;
        return privateKeyPem;
    } catch (error) {
        throw error;
    }
}

async function decryptData(private_key, ciphertext) {
    try {
        const decrypted = crypto.privateDecrypt(Buffer.from(private_key), Buffer.from(ciphertext));
        return decrypted.toString('utf8');
    } catch (error) {
        throw error;
    }
}

async function getDataBase(dataUser) {
    try {
        const data = await client.scan({
            TableName: "UserTable",
            FilterExpression: "#user = :user",
            ExpressionAttributeNames: {
                "#user": "user"
            },
            ExpressionAttributeValues: {
                ":user": dataUser.user
            }
        }).promise();
        console.log('data', data);
        return data;
    } catch (error) {
        throw error;
    }
}

async function validateUser(dataBase, dataUser) {
    try {
        if (dataBase.password == dataUser.password) {
            return "contraseña correcta";
        } else {
            throw new Error(`validateUser: contrasena incorrecta`);
        }
    } catch (error) {
        throw error;
    }
}

exports.validate_user = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const privateKeyPem = await decryptPrivateKey(body.private_key);
        const decryptedData = await decryptData(privateKeyPem, body.encrypt_data);
        const dataBase = await getDataBase(JSON.parse(decryptedData));
        const validateData = await validateUser(dataBase.Items[0], JSON.parse(decryptedData));

        return {
            statusCode: 200,
            body: JSON.stringify({
                decryptedData: decryptedData,
                dataBase: dataBase.Items[0],
                validateData: validateData
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error,
            })
        };
    }
};