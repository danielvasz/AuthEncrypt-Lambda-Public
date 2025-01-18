require('dotenv').config();
const URL = process.env.URL_LAMBDA_FUNCTION
async function serverGenerateKey() {
    const serverURL = `${URL}/generate_key`;
    try {
        const response = await fetch(serverURL);
        return await response.json();
    } catch (error) {
        throw new Error(`serverGenerateKey: ${error}`);
    }
}

/**
 * 
 * @param {*} params 
 */
async function serverValidateUser(encrypt_data, private_key) {
    const serverURL = `${URL}/validate_user`;
    try {
        const response = await fetch(serverURL, {
            method: "POST",
            body: JSON.stringify({
                private_key: private_key,
                encrypt_data: encrypt_data
            })
        });
        return await response.json();
    } catch (error) {
        throw new Error(`serverValidateUser: ${error}`);
    }
}

module.exports = {
    serverGenerateKey,
    serverValidateUser
};


