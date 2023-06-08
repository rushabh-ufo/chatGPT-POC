const AWS = require('aws-sdk');
const { Configuration, OpenAIApi } = require('openai');
AWS.config.update({region: 'us-east-1'});

exports.lambdaHandler = async (event) => {
    try {
        const input = JSON.parse(event.body);
        const chatGPTSecret = await exports.get_secret_from_secretsmanager();
        const openai = await exports.getOpenAIObject(chatGPTSecret);
        const gptResponse = await exports.getChatGPTPrompt(openai, input);
        console.log(gptResponse);
        return {
            statusCode: 200,
            body: JSON.stringify(gptResponse)
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}

exports.get_secret_from_secretsmanager = async () => {
    const secretsmanager = new AWS.SecretsManager();
    const params = {
        SecretId: process.env.SECRET_NAME
    };
    const data = await secretsmanager.getSecretValue(params).promise();
    return data.SecretString;
}

exports.getOpenAIObject = async (apiKey) => {
    const configuration = new Configuration({
        apiKey
    });
    const openai = new OpenAIApi(configuration);
    return openai;
}

exports.getChatGPTPrompt = async (openai, input) => {

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: input.data,
        temperature: 1,
        max_tokens: 256,
        top_p: 1
    });
    return response.data.choices[0].text;
}