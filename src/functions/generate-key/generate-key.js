const AWS = require("aws-sdk");
require('dotenv').config();
AWS.config.update({ region: "us-east-1" });
const kms = new AWS.KMS();

async function generateKeyPlaintext() {
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
}

exports.generate_key = async () => {
    const { 
        public_key, 
        private_key 
    } = await generateKeyPlaintext();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            public_key,
            private_key
        }),
    };
};