const AWS = require('aws-sdk');
const client = new AWS.DynamoDB.DocumentClient();

async function addItem() {
    const items = [
        {
            id: '10-1010-1010',
            user: 'daniel', 
            password: 'prueba123',
            address: 'panama'
        }, {
            id: '11-1010-1010',
            user: 'jorge', 
            password: 'prueba123',
            address: 'panama'
        }, {
            id: '12-1010-1010',
            user: 'roberto', 
            password: 'prueba123',
            address: 'panama'
        }
    ];

    try {
        for (const item in items) {
            await client.put({
                TableName: 'UserTable',
                Item: items[item]
            }).promise();
        }
    } catch (error) {
        throw new Error(`addItem: ${error}`);
    }
}

exports.create_table = async (event) => {
    try {
        await addItem();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                'datebase': 'EXITO'
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