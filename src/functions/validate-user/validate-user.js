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
        throw new Error(`decryptPrivateKey: ${error}`);
    }
}

async function decryptData(private_key, ciphertext) {
    try {
        const decrypted = crypto.privateDecrypt(Buffer.from(private_key), Buffer.from(ciphertext));
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error(`decryptData: ${error}`);
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
        throw new Error(`getDataBase: ${error}`);
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
        throw new Error(`validateUser: ${error}`);
    }
}

exports.validate_user = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const privateKeyPem = await decryptPrivateKey(body.private_key);
        console.log("privateKeyPem", privateKeyPem);
        const decryptedData = await decryptData(privateKeyPem, body.encrypt_data);
        console.log("decryptedData", decryptedData);
        const dataBase = await getDataBase(JSON.parse(decryptedData));
        console.log("dataBase", dataBase);
        const validateData = await validateUser(dataBase.Items[0], JSON.parse(decryptedData));
        console.log("validateData", validateData);
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