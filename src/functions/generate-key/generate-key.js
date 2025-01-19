const AWS = require("aws-sdk");
require('dotenv').config();
AWS.config.update({ region: "us-east-1" });
const kms = new AWS.KMS();

async function generateKeyPlaintext() {
    try {
        const params = {
            KeyId: process.env.SYMETRIC_KEY_KMS,
            KeyPairSpec: "RSA_3072"
        };
        const command = await kms.generateDataKeyPairWithoutPlaintext(params).promise();
        const public_key = command.PublicKey;
        const private_key = command.PrivateKeyCiphertextBlob
        return {
            public_key: public_key, 
            private_key: private_key
        };
    } catch (error) {
        throw error;
    }
}

exports.generate_key = async () => {
    try {
        const { public_key, private_key } = await generateKeyPlaintext();

        return {
            statusCode: 200,
            body: JSON.stringify({
                public_key,
                private_key
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error
            }),
        };
    }
};